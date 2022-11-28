import * as path from "https://deno.land/std@0.166.0/path/mod.ts";

import {
  getPrismaSchema,
  graphql,
  PrismaSchema,
  Project,
} from "./deps.ts";
import { capitalizeFirstLetter, varStartsWithUppercase } from "./utils.ts";

const pathToGraphQL = "/Users/orta/dev/puzmo/.redwood/schema.graphql";
const fileToRead = "/Users/orta/dev/puzmo/api/src/services/dailies/dailies.ts";
const prismaFile = "/Users/orta/dev/puzmo/api/db/schema.prisma";

let gqlSchema: graphql.GraphQLSchema | undefined;
const getGraphQLSDLFromFile = async () => {
  const schema = await Deno.readTextFile(pathToGraphQL);
  gqlSchema = graphql.buildSchema(schema);
};

let prismaSchema: PrismaSchema | undefined;
const getPrismaSchemaFromFile = async () => {
  const prismaSchemaText = await Deno.readTextFile(prismaFile);
  //
  prismaSchema = getPrismaSchema(
    prismaSchemaText.replaceAll("@default([])", "@default([1])"),
  );
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

  // console.log(queryResolvers.map(v => v.getName()))

  const fileDTS = project.createSourceFile(
    "/source/index.d.ts",
    "/** Codegen */",
    { overwrite: true },
  );

  const queryType = gqlSchema!.getQueryType();
  if (!queryType) throw new Error("No query type");

  const mutationType = gqlSchema!.getMutationType();
  if (!mutationType) throw new Error("No query type");

  queryResolvers.forEach((v) => {
    addTypeForQueryResolver(v.getName());
  });

  function addTypeForQueryResolver(name: string) {
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
        if(a.type)
        argsInterface.addProperty({ name: a.name, type: a.type.toString() });
      });
    }

    const argsParam = field.args.length
      ? `${interfaceDeclaration.getName()}Args`
      : "{}";
  
    interfaceDeclaration.addCallSignature({
      parameters: [{ name: "args", type: argsParam }, { name: "obj", type: "any", }],
    });

    //  obj?: { root: TParent; context: TContext; info: GraphQLResolveInfo }

    // interfaceDeclaration.addCallSignature({
    //   parameters:
    // })

    // const interfaceProperty = interfaceDeclaration .addProperty({
    //     name: 'name',
    //     type: 'number',
    // })
    // interfaceProperty.setHasQuestionToken(true);
    // InterfaceDeclaration.addExtends('InterfaceToExtend')
  }
  console.log(fileDTS.getText());
};

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  Deno.stdout.write(
    new TextEncoder().encode("\x1b[2J"),
  );

  await getGraphQLSDLFromFile();
  await getPrismaSchemaFromFile();

  await getFileTSInfo(fileToRead);
  // console.log(prismaSchema.list)
}
