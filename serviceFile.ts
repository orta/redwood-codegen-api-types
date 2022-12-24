import {
  capitalizeFirstLetter,
  createAndReferOrInlineArgsForField,
  inlineArgsForField,
  variableDeclarationIsAsync,
  varStartsWithUppercase,
} from "./utils.ts";
import { typeMapper } from "./typeMap.ts";
import { graphql, path, tsMorph } from "./deps.ts";
import { AppContext } from "./context.ts";
import { FieldFacts } from "./typeFacts.ts";

export const lookAtServiceFile = async (file: string, context: AppContext) => {
  const { gql, prisma, settings } = context;

  if (!gql) throw new Error("No schema");
  if (!prisma) throw new Error("No prisma schema");

  // This isn't good enough, needs to be relative to api/src/services
  const filename = path.basename(file);
  const fileContents = await context.readFile(file);
  const referenceFileSourceFile = context.tsProject.createSourceFile(
    `/source/${filename}`,
    fileContents,
  );

  const vars = referenceFileSourceFile.getVariableDeclarations().filter((v) => v.isExported());

  const resolverContainers = vars.filter(varStartsWithUppercase);

  // TODO: Check this is everything, you can define a resolver via function or arrows
  const queryResolvers = vars.filter((v) => !varStartsWithUppercase(v));

  const fileDTS = context.tsProject.createSourceFile(
    "/source/index.d.ts",
    "",
    { overwrite: true },
  );

  const queryType = gql.getQueryType();
  if (!queryType) throw new Error("No query type");

  const mutationType = gql.getMutationType();
  if (!mutationType) throw new Error("No mutation type");

  const externalMapper = typeMapper(context, { preferPrismaModels: true });
  const returnTypeMapper = typeMapper(context, {});

  queryResolvers.forEach((v, i) => {
    addTypeForQueryResolver(v.getName(), {
      parentName: queryType.name,
      // This does not work
      isAsync: variableDeclarationIsAsync(v),
    });
  });

  resolverContainers.forEach((c) => {
    addCustomTypeResolvers(c, {});
  });

  fileDTS.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: "graphql",
    namedImports: ["GraphQLResolveInfo"],
  });

  fileDTS.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: "@redwoodjs/graphql-server/dist/functions/types",
    namedImports: ["RedwoodGraphQLContext"],
  });

  const sharedGraphQLObjectsReferenced = externalMapper.getReferencedGraphQLThingsInMapping();
  if (sharedGraphQLObjectsReferenced.types.length) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: `./${settings.sharedFilename.replace(".d.ts", "")}`,
      namedImports: sharedGraphQLObjectsReferenced.types,
    });
  }

  const sharedInternalGraphQLObjectsReferenced = returnTypeMapper.getReferencedGraphQLThingsInMapping();
  if (sharedInternalGraphQLObjectsReferenced.types.length) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: `./${settings.sharedInternalFilename.replace(".d.ts", "")}`,
      namedImports: sharedInternalGraphQLObjectsReferenced.types.map((t) => `${t} as RT${t}`),
    });
  }

  const aliases = [...new Set([...sharedGraphQLObjectsReferenced.scalars, ...sharedInternalGraphQLObjectsReferenced.scalars])];
  if (aliases.length) {
    fileDTS.addTypeAliases(
      aliases.map((s) => ({
        name: s,
        type: "any",
      })),
    );
  }

  const prismases = [...new Set([...sharedGraphQLObjectsReferenced.prisma, ...sharedInternalGraphQLObjectsReferenced.prisma])];
  if (prismases.length) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: "@prisma/client",
      namedImports: sharedGraphQLObjectsReferenced.prisma.map((p) => `${p} as P${p}`),
    });
  }

  fileDTS.formatText({ indentSize: 2 });

  await context.writeTextFile(
    path.join(
      context.settings.typesFolderRoot,
      filename.replace(".ts", ".d.ts"),
    ),
    fileDTS.getText(),
  );

  return;

  function addTypeForQueryResolver(
    name: string,
    config: { isAsync: boolean; parentName: string },
  ) {
    let field = queryType!.getFields()[name];
    if (!field) {
      field = mutationType!.getFields()[name];
    }
    if (!field) {
      fileDTS.addStatements(
        `\n// ${name} does not exist on Query or Mutation`,
      );
      return;
    }

    // if (!field) throw new Error(`No field named ${name} on Query`)

    const interfaceDeclaration = fileDTS.addInterface({
      name: `${capitalizeFirstLetter(name)}Resolver`,
      isExported: true,
      docs: ["SDL: " + graphql.print(field.astNode!)],
    });

    const args = createAndReferOrInlineArgsForField(field, {
      name: interfaceDeclaration.getName(),
      file: fileDTS,
      mapper: externalMapper.map,
    });

    const argsParam = args || "{}";

    const parentType = config.parentName === "Query" || config.parentName === "Mutation" ? "{}" : config.parentName;
    const tType = returnTypeMapper.map(field.type, { preferNullOverUndefined: true, typenamePrefix: "RT" });
    const returnType = `${tType} | Promise<${tType}> | (() => Promise<${tType}>)`;

    interfaceDeclaration.addCallSignature({
      parameters: [{ name: "args", type: argsParam }, {
        name: "obj",
        type: `{ root: ${parentType}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }`,
      }],
      returnType,
    });
  }

  function addCustomTypeResolvers(
    variableDeclaration: tsMorph.VariableDeclaration,
    config: {},
  ) {
    const declarations = variableDeclaration.getVariableStatementOrThrow()
      .getDeclarations();

    declarations.forEach((d) => {
      const name = d.getName();
      // only do it if the first letter is a capital
      if (!name.match(/^[A-Z]/)) return;

      const type = d.getType();
      const hasGenericArgs = type && type.getText().includes("<");
      const fieldFacts: FieldFacts = {};

      // Grab the const Thing = { ... }
      const obj = d.getFirstDescendantByKind(
        tsMorph.SyntaxKind.ObjectLiteralExpression,
      );
      if (!obj) {
        throw new Error(
          `Could not find an object literal ( e.g. a { } ) in ${d.getName()}`,
        );
      }

      // Get a list of the defined keys
      const keys: string[] = [];
      obj.getProperties().forEach((p) => {
        if (p.isKind(tsMorph.SyntaxKind.PropertyAssignment)) {
          keys.push(p.getName());
        }
        if (p.isKind(tsMorph.SyntaxKind.FunctionDeclaration) && p.getName()) {
          keys.push(p.getName()!);
        }
      });

      // Make an interface

      // Account: MergePrismaWithSdlTypes<PrismaAccount, MakeRelationsOptional<Account, AllMappedModels>, AllMappedModels>;
      const gqlType = gql.getType(d.getName());
      if (!gqlType) {
        // throw new Error(`Could not find a GraphQL type named ${d.getName()}`);
        fileDTS.addStatements(
          `\n// ${d.getName()} does not exist in the schema`,
        );
        return;
      }
      if (!graphql.isObjectType(gqlType)) {
        throw new Error(
          `In your schema ${d.getName()} is not an object, which we can only make resolver types for`,
        );
      }

      const fields = gqlType.getFields();

      // See:   https://github.com/redwoodjs/redwood/pull/6228#issue-1342966511
      // For more ideas
      fileDTS.addTypeAlias({
        name: `${name}AsParent`,
        typeParameters: hasGenericArgs ? ["Extended"] : [],
        type: `P${name} & { ${
          keys.map((k) => `${k}: () => Promise<${externalMapper.map(fields[k].type, {})}>`).join(
            ", \n",
          )
        } }` + (hasGenericArgs ? " & Extended" : ""),
      });

      const resolverInterface = fileDTS.addInterface({
        name: `${name}TypeResolvers`,
        typeParameters: hasGenericArgs ? ["Extended"] : [],
        isExported: true,
      });

      keys.forEach((k) => {
        const field = fields[k];
        if (field) {
          if (fieldFacts[k]) fieldFacts[k].hasResolverImplementation = true;
          else fieldFacts[k] = { hasResolverImplementation: true };

          const argsType = inlineArgsForField(field, { mapper: externalMapper.map });
          const param = hasGenericArgs ? "<Extended>" : "";
          const innerArgs =
            `args: ${argsType}, obj: { root: ${name}AsParent${param}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }`;

          const returnObj = returnTypeMapper.map(field.type, { preferNullOverUndefined: true, typenamePrefix: "RT" });
          const returnType = `${returnObj} | Promise<${returnObj}> | (() => Promise<${returnObj}>)`;

          resolverInterface.addProperty({
            name: k,
            leadingTrivia: "\n",
            docs: ["SDL: " + graphql.print(field.astNode!)],
            type: `(${innerArgs}) => ${returnType}`,
          });
        } else {
          resolverInterface.addCallSignature({
            docs: [
              ` @deprecated: SDL ${d.getName()}.${k} does not exist in your schema`,
            ],
          });
        }
      });

      context.fieldFacts.set(d.getName(), fieldFacts);
    });
  }
};
