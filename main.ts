import { getPrismaSchema, graphql, path, Project } from "./deps.ts";

import { PrismaMap, prismaModeller } from "./prismaModeller.ts";
import { createSharedSchemaFiles } from "./sharedSchema.ts";
import { AppContext } from "./context.ts";
import { getFileTSInfo } from "./serviceFile.ts";

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

  console.log(`Updated ${appContext.settings.typesFolderRoot}`);
}
