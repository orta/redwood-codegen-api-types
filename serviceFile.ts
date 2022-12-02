import { capitalizeFirstLetter, createAndReferOrInlineArgsForField, variableDeclarationIsAsync, varStartsWithUppercase } from "./utils.ts";
import { typeMapper } from "./typeMap.ts";
import { graphql, path, tsMorph } from "./deps.ts";
import { AppContext } from "./context.ts";

export const lookAtServiceFile = async (file: string, context: AppContext) => {
  const { gql, prisma, tsProject, settings } = context;

  if (!gql) throw new Error("No schema");
  if (!prisma) throw new Error("No prisma schema");

  // This isn't good enough, needs to be relative to api/src/services
  const filename = path.basename(file);
  const fileContents = await Deno.readTextFile(file);
  const referenceFileSourceFile = context.tsProject.createSourceFile(
    `/source/${filename}`,
    fileContents,
  );

  const vars = referenceFileSourceFile.getVariableDeclarations().filter((v) => v.isExported());
  const fns = referenceFileSourceFile.getFunctions().filter((v) => v.isExported);

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
  if (!mutationType) throw new Error("No query type");

  const { map, getReferencedGraphQLThingsInMapping } = typeMapper(context, {
    preferPrismaModels: true,
  });

  queryResolvers.forEach((v, i) => {
    // if (i !== 8) return;
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

  const sharedGraphQLObjectsReferenced = getReferencedGraphQLThingsInMapping();
  if (sharedGraphQLObjectsReferenced.types.length) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: `./${settings.sharedFilename}`,
      namedImports: sharedGraphQLObjectsReferenced.types,
    });
  }

  if (sharedGraphQLObjectsReferenced.scalars.length) {
    fileDTS.addTypeAliases(
      sharedGraphQLObjectsReferenced.scalars.map((s) => ({
        name: s,
        type: "any",
      })),
    );
  }

  if (sharedGraphQLObjectsReferenced.prisma.length) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: "@prisma/client",
      namedImports: sharedGraphQLObjectsReferenced.prisma.map((p) => `${p} as P${p}`),
    });
  }

  Deno.writeTextFileSync(
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
    let isQuery = true;
    let field = queryType!.getFields()[name];
    if (!field) {
      isQuery = false;
      field = mutationType!.getFields()[name];
    }
    if (!field) {
      fileDTS.addStatements(
        `\n// ${name} does not exist on Query or Mutation`,
      );
      return;
    }

    const prefix = isQuery ? "Q" : "M";
    // if (!field) throw new Error(`No field named ${name} on Query`)

    const interfaceDeclaration = fileDTS.addInterface({
      name: `${prefix}${capitalizeFirstLetter(name)}`,
      isExported: true,
    });

    const args = createAndReferOrInlineArgsForField(field, {
      name: interfaceDeclaration.getName(),
      file: fileDTS,
      mapper: map,
    });

    const argsParam = args || "{}";

    const parentType = config.parentName === "Query" || config.parentName === "Mutation" ? "{}" : config.parentName;

    interfaceDeclaration.addCallSignature({
      docs: ["SDL: " + graphql.print(field.astNode!)],
      parameters: [{ name: "args", type: argsParam }, {
        name: "obj",
        type: `{ root: ${parentType}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }`,
      }],
      returnType: config.isAsync ? `Promise<${map(field.type)}>` : map(field.type),
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

      // Grab the const Thing = { ... }
      const obj = d.getFirstDescendantByKind(tsMorph.SyntaxKind.ObjectLiteralExpression);
      if (!obj) throw new Error(`Could not find an object literal ( e.g. a { } ) in ${d.getName()}`);

      // Get a list of the defined keys
      const keys: string[] = [];
      obj.getProperties().forEach((p) => {
        if (p.isKind(tsMorph.SyntaxKind.PropertyAssignment)) keys.push(p.getName());
        if (p.isKind(tsMorph.SyntaxKind.FunctionDeclaration) && p.getName()) keys.push(p.getName()!);
      });

      // Make an interface

      // Account: MergePrismaWithSdlTypes<PrismaAccount, MakeRelationsOptional<Account, AllMappedModels>, AllMappedModels>;

      const prismaModel = context.prisma.get(name);

      const gqlType = gql.getType(d.getName());
      if (!gqlType) {
        // throw new Error(`Could not find a GraphQL type named ${d.getName()}`);
        fileDTS.addStatements(
          `\n// ${d.getName()} does not exist in the schema`,
        );
        return;
      }
      if (!graphql.isObjectType(gqlType)) {
        throw new Error(`In your schema ${d.getName()} is not an object, which we can only make resolver types for`);
      }

      const fields = gqlType.getFields();

      // See:   https://github.com/redwoodjs/redwood/pull/6228#issue-1342966511
      // For more ideas
      const parentType = fileDTS.addTypeAlias({
        name: `${name}AsParent`,
        type: `P${name} & { ${keys.map((k) => `${k}: () => Promise<${map(fields[k].type)}>`).join(", \n")} }`,
      });

      const resolverInterface = fileDTS.addInterface({
        name: `${name}Resolvers`,
        isExported: true,
      });

      keys.forEach((k) => {
        const field = fields[k];
        if (field) {
          const args = field.args.map((f) => `${f.name}: ${map(f.type)}`).join(", ") || "{}";
          const innerArgs = `args: ${args}, obj: { root: ${name}AsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }`;

          resolverInterface.addProperty({
            name: k,
            docs: ["SDL: " + graphql.print(field.astNode!)],
            // parameters: [{ name: "args", type: args }, {
            //   name: "obj",
            //   type: `{ root: ${d.getName()},  }`,
            // }],
            // returnType: map(field.type), // config.isAsync ? `Promise<${map(field.type)}>` : map(field.type),
            type: `(${innerArgs}) => ${map(field.type)}`,
          });
        } else {
          resolverInterface.addCallSignature({ docs: [` @deprecated: SDL ${d.getName()}.${k} does not exist in your schema`] });
        }
      });
    });
  }
};

// parameters: [{ name: "args", type: argsParam }, {
//   name: "obj",
//   type: `{ root: ${parentType}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }`,
// }],
