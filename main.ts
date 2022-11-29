import * as path from "https://deno.land/std@0.166.0/path/mod.ts";

import { getPrismaSchema, graphql, Project } from "./deps.ts";
import {
  capitalizeFirstLetter,
  variableDeclarationIsAsync,
  varStartsWithUppercase,
} from "./utils.ts";
import { typeMapper } from "./typeMap.ts";
import { PrismaMap, prismaModeller } from "./prismaModeller.ts";

const pathToGraphQL = "/Users/orta/dev/puzmo/.redwood/schema.graphql";
const fileToRead = "/Users/orta/dev/puzmo/api/src/services/dailies/dailies.ts";
const prismaFile = "/Users/orta/dev/puzmo/api/db/schema.prisma";

let gqlSchema: graphql.GraphQLSchema | undefined;
const getGraphQLSDLFromFile = async () => {
  const schema = await Deno.readTextFile(pathToGraphQL);
  gqlSchema = graphql.buildSchema(schema);
};

let prismaSchema: PrismaMap = new Map();
const getPrismaSchemaFromFile = async () => {
  const prismaSchemaText = await Deno.readTextFile(prismaFile);
  //
  const prismaSchemaBlocks = getPrismaSchema(
    prismaSchemaText.replaceAll("@default([])", "@default([1])"),
  );
  prismaSchema = prismaModeller(prismaSchemaBlocks);
};

const getFileTSInfo = async (file: string) => {
  if (!gqlSchema) throw new Error("No schema");
  if (!prismaSchema) throw new Error("No prisma schema");

  // This isn't good enough, needs to be relative to api/src/services
  const filename = path.basename(file);
  const fileContents = await Deno.readTextFile(file);
  const project = new Project({ useInMemoryFileSystem: true });
  const referenceFileSourceFile = project.createSourceFile(
    `/source/${filename}`,
    fileContents,
  );

  const vars = referenceFileSourceFile.getVariableDeclarations().filter((v) =>
    v.isExported()
  );
  const fns = referenceFileSourceFile.getFunctions().filter((v) =>
    v.isExported
  );

  const resolverContainers = vars.filter(varStartsWithUppercase);
  const queryResolvers = vars.filter((v) => !varStartsWithUppercase(v));

  const fileDTS = project.createSourceFile(
    "/source/index.d.ts",
    "",
    { overwrite: true },
  );

  const queryType = gqlSchema!.getQueryType();
  if (!queryType) throw new Error("No query type");

  const mutationType = gqlSchema!.getMutationType();
  if (!mutationType) throw new Error("No query type");

  const { map, getReferencedGraphQLTypesInMapping } = typeMapper(prismaSchema);

  queryResolvers.forEach((v, i) => {
    // if (i !== 8) return;
    addTypeForQueryResolver(v.getName(), {
      parentName: queryType.name,
      isAsync: variableDeclarationIsAsync(v),
    });
  });

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
      fileDTS.addStatements(`\n// ${name} does not exist on Query or Mutation`);
      return;
    }

    const prefix = isQuery ? "Q" : "M";
    // if (!field) throw new Error(`No field named ${name} on Query`)

    const interfaceDeclaration = fileDTS.addInterface({
      name: `${prefix}${capitalizeFirstLetter(name)}`,
      isExported: true,
    });

    if (field.args.length) {
      const argsInterface = fileDTS.addInterface({
        name: `${interfaceDeclaration.getName()}Args`,
        isExported: true,
      });

      field.args.forEach((a) => {
        argsInterface.addProperty({ name: a.name, type: map(a.type) });
      });
    }

    const argsParam = field.args.length
      ? `${interfaceDeclaration.getName()}Args`
      : "{}";

    const parentType =
      config.parentName === "Query" || config.parentName === "Mutation"
        ? "{}"
        : config.parentName;

    interfaceDeclaration.addCallSignature({
      docs: ["SDL: " + graphql.print(field.astNode!)],
      parameters: [{ name: "args", type: argsParam }, {
        name: "obj",
        type:
          `{ root: ${parentType}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }`,
      }],
      returnType: config.isAsync
        ? `Promise<${map(field.type)}>`
        : map(field.type),
    });
  }

  fileDTS.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: "graphql",
    namedImports: ["GraphQLResolveInfo"],
  });

  const sharedGraphQLObjectsReferenced = getReferencedGraphQLTypesInMapping();
  if (sharedGraphQLObjectsReferenced.length) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: "./shared-schema-types.d.ts",
      namedImports: sharedGraphQLObjectsReferenced,
    });
  }

  console.log(fileDTS.getText());
};

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  Deno.stdout.write(
    new TextEncoder().encode("\x1b[2J"),
  );
  console.log("-----------------------\n");

  await getGraphQLSDLFromFile();
  await getPrismaSchemaFromFile();

  await getFileTSInfo(fileToRead);
  // console.log(prismaSchema.list)
}
