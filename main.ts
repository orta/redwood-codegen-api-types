import { getPrismaSchema, graphql, path, Project } from "./deps.ts";
import {
  capitalizeFirstLetter,
  createAndReferOrInlineArgsForField,
  variableDeclarationIsAsync,
  varStartsWithUppercase,
} from "./utils.ts";
import { typeMapper } from "./typeMap.ts";
import { PrismaMap, prismaModeller } from "./prismaModeller.ts";
import { createSharedSchemaFiles } from "./sharedSchema.ts";
import { AppContext } from "./context.ts";

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

const getFileTSInfo = async (file: string, context: AppContext) => {
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

  const vars = referenceFileSourceFile.getVariableDeclarations().filter((v) =>
    v.isExported()
  );
  const fns = referenceFileSourceFile.getFunctions().filter((v) =>
    v.isExported
  );

  const resolverContainers = vars.filter(varStartsWithUppercase);
  const queryResolvers = vars.filter((v) => !varStartsWithUppercase(v));

  const fileDTS = context.tsProject.createSourceFile(
    "/source/index.d.ts",
    "",
    { overwrite: true },
  );

  const queryType = gqlSchema!.getQueryType();
  if (!queryType) throw new Error("No query type");

  const mutationType = gqlSchema!.getMutationType();
  if (!mutationType) throw new Error("No query type");

  const { map, getReferencedGraphQLThingsInMapping } = typeMapper(context, {
    preferPrismaModels: true,
  });

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

    const args = createAndReferOrInlineArgsForField(field, {
      name: interfaceDeclaration.getName(),
      file: fileDTS,
      mapper: map,
    });

    const argsParam = args || "{}";

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
      namedImports: sharedGraphQLObjectsReferenced.prisma.map((p) =>
        `${p} as P${p}`
      ),
    });
  }

  Deno.writeTextFileSync(
    path.join(
      context.settings.typesFolderRoot,
      filename.replace(".ts", ".d.ts"),
    ),
    fileDTS.getText(),
  );
};

const pathToGraphQL = "/Users/orta/dev/puzmo/.redwood/schema.graphql";
const redwoodProjectRoot = "/Users/orta/dev/puzmo/";
const prismaFile = "/Users/orta/dev/puzmo/api/db/schema.prisma";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  Deno.stdout.write(
    new TextEncoder().encode("\x1b[2J"),
  );
  console.log("-----------------------\n");

  await getGraphQLSDLFromFile();
  await getPrismaSchemaFromFile();

  const project = new Project({ useInMemoryFileSystem: true });

  const appContext: AppContext = {
    gql: gqlSchema!,
    prisma: prismaSchema,
    tsProject: project,
    settings: {
      root: redwoodProjectRoot,
      graphQLSchemaPath: path.join(
        redwoodProjectRoot,
        ".redwood",
        "schema.graphql",
      ),
      apiServicesPath: path.join(redwoodProjectRoot, "api", "src", "services"),
      prismaDSLPath: path.join(
        redwoodProjectRoot,
        "api",
        "db",
        "schema.prisma",
      ),
      sharedFilename: "shared-schema-types.d.ts",
      typesFolderRoot:
        "/Users/orta/dev/redwood-codegen-api-types/ignored/puzmo",
    },
  };

  // Test one rando file
  // await getFileTSInfo(fileToRead, appContext);

  const serviceFilesToLookAt = [] as string[];
  for await (
    const dirEntry of Deno.readDir(appContext.settings.apiServicesPath)
  ) {
    // These are generally the folders
    if (dirEntry.isDirectory) {
      const folderPath = path.join(
        appContext.settings.apiServicesPath,
        dirEntry.name,
      );
      // And these are the files i nthem
      for await (const subdirEntry of Deno.readDir(folderPath)) {
        if (subdirEntry.isFile && subdirEntry.name.endsWith(".ts")) {
          serviceFilesToLookAt.push(path.join(folderPath, subdirEntry.name));
        }
      }
    }
  }

  createSharedSchemaFiles(appContext);

  for (const path of serviceFilesToLookAt) {
    await getFileTSInfo(path, appContext);
  }
  // console.log(serviceFilesToLookAt);

  // console.log(prismaSchema.list)
}
