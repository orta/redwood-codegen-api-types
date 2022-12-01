import { capitalizeFirstLetter, createAndReferOrInlineArgsForField, variableDeclarationIsAsync, varStartsWithUppercase } from "./utils.ts";
import { typeMapper } from "./typeMap.ts";
import { graphql, path, tsMorph } from "./deps.ts";
import { AppContext } from "./context.ts";

export const getFileTSInfo = async (file: string, context: AppContext) => {
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

    console.log(declarations.map((d) => d.getName()));
  }
};
