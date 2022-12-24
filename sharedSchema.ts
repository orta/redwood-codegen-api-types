/// The main schema for objects and inputs

import { AppContext } from "./context.ts";
import { graphql, path, tsMorph } from "./deps.ts";
import { typeMapper } from "./typeMap.ts";

export const createSharedSchemaFiles = async (context: AppContext) => {
  // We want to make a file with everything except Query and Mutation in it.
  const { gql, prisma, fieldFacts } = context;

  const types = gql.getTypeMap();
  const knownPrimitives = ["String", "Boolean", "Int"];

  const mapper = typeMapper(context, {});

  const tsFile = context.tsProject.createSourceFile(
    `/source/${context.settings.sharedFilename}`,
    "",
  );

  Object.keys(types).forEach((name) => {
    if (name.startsWith("__")) return;
    if (knownPrimitives.includes(name)) return;

    const type = types[name];
    const pType = prisma.get(name);

    if (
      graphql.isObjectType(type) || graphql.isInterfaceType(type) ||
      graphql.isInputObjectType(type)
    ) {
      // This is slower than it could be, use the add many at once api
      const docs = [];
      if (pType?.leadingComments) docs.push(pType.leadingComments);
      if (type.description) docs.push(type.description);

      tsFile.addInterface({
        name: type.name,
        isExported: true,
        docs: [],
        properties: [
          {
            name: "__typename",
            type: `"${type.name}"`,
            hasQuestionToken: true,
          },
          ...Object.entries(type.getFields()).map(([fieldName, obj]) => {
            const docs = [];
            const prismaField = pType?.properties.get(fieldName);

            if (prismaField && prismaField.leadingComments.length) {
              docs.push(prismaField.leadingComments.trim());
            }
            // if (obj.description) docs.push(obj.description);
            const hasResolverImplementation = fieldFacts.get(name)?.[fieldName]?.hasResolverImplementation;
            const isOptionalInSDL = !graphql.isNonNullType(obj.type);
            const doesNotExistInPrisma = false; // !prismaField;

            const field: tsMorph.OptionalKind<tsMorph.PropertySignatureStructure> = {
              name: fieldName,
              type: mapper.map(obj.type, { preferNullOverUndefined: true }),
              docs,
              hasQuestionToken: hasResolverImplementation || isOptionalInSDL || doesNotExistInPrisma,
            };
            return field;
          }),
        ],
      });
    }

    if (graphql.isEnumType(type)) {
      tsFile.addTypeAlias({
        name: type.name,
        type: '"' + type.getValues().map((m) => m.value).join('" | "') + '"',
      });
    }
  });

  const { scalars } = mapper.getReferencedGraphQLThingsInMapping();
  if (scalars.length) {
    tsFile.addTypeAliases(
      scalars.map((s) => ({
        name: s,
        type: "any",
      })),
    );
  }

  tsFile.formatText({ indentSize: 2 });

  await context.writeTextFile(
    path.join(
      context.settings.typesFolderRoot,
      context.settings.sharedFilename,
    ),
    tsFile.getText(),
  );
};
