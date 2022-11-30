/// The main schema for objects and inputs

import { AppContext } from "./context.ts";
import { graphql, path } from "./deps.ts";
import { typeMapper } from "./typeMap.ts";

export const createSharedSchemaFiles = (context: AppContext) => {
  // We want to make a file with everything except Query and Mutation in it.
  const { gql, prisma, tsProject, settings } = context;

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
        properties: Object.entries(type.getFields()).map(([name, obj]) => {
          const docs = [];
          const prismaField = pType?.properties.get(name);

          if (prismaField && prismaField.leadingComments.length) {
            docs.push(prismaField.leadingComments.trim());
          }
          // if (obj.description) docs.push(obj.description);

          return {
            name,
            type: mapper.map(obj.type),
            docs,
          };
        }),
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

  Deno.writeTextFileSync(
    path.join(
      context.settings.typesFolderRoot,
      context.settings.sharedFilename,
    ),
    tsFile.getText(),
  );
};
