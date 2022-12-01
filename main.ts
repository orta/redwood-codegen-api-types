// deno run --allow-all --unstable main.ts
// or watch mode:
// deno run --allow-all --unstable --watch main.ts

import { getPrismaSchema, graphql, path, Project } from "./deps.ts";

import { PrismaMap, prismaModeller } from "./prismaModeller.ts";
import { createSharedSchemaFiles } from "./sharedSchema.ts";
import { AppContext } from "./context.ts";
import { getFileTSInfo } from "./serviceFile.ts";

let gqlSchema: graphql.GraphQLSchema | undefined;
const getGraphQLSDLFromFile = async (settings: AppContext["settings"]) => {
  const schema = await Deno.readTextFile(settings.graphQLSchemaPath);
  gqlSchema = graphql.buildSchema(schema);
};

let prismaSchema: PrismaMap = new Map();
const getPrismaSchemaFromFile = async (settings: AppContext["settings"]) => {
  const prismaSchemaText = await Deno.readTextFile(settings.prismaDSLPath);
  //
  const prismaSchemaBlocks = getPrismaSchema(
    prismaSchemaText.replaceAll("@default([])", "@default([1])"),
  );
  prismaSchema = prismaModeller(prismaSchemaBlocks);
};

// Mac
// const redwoodProjectRoot = "/Users/orta/dev/puzmo/site/";
/// Linux
// const redwoodProjectRoot = "/home/orta/dev/puzmo/puzmo/";

// Vendored
const redwoodProjectRoot = "/home/orta/dev/puzmo/redwood-codegen-api-types/tests/vendor/soccersage.io-main";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  Deno.stdout.write(new TextEncoder().encode("\x1b[2J"));
  console.log("-----------------------\n");
  const project = new Project({ useInMemoryFileSystem: true });

  const settings: AppContext["settings"] = {
    root: redwoodProjectRoot,
    graphQLSchemaPath: path.join(
      redwoodProjectRoot,
      ".redwood",
      "schema.graphql",
    ),
    apiServicesPath: path.join(redwoodProjectRoot, "api", "src", "services"),
    prismaDSLPath: path.join(redwoodProjectRoot, "api", "db", "schema.prisma"),
    sharedFilename: "shared-schema-types.d.ts",
    typesFolderRoot:
      // "/home/orta/dev/puzmo/redwood-codegen-api-types/ignored/puzmo",
      "/home/orta/dev/puzmo/redwood-codegen-api-types/tests/vendor/soccersage-output",
  };

  await getGraphQLSDLFromFile(settings);
  await getPrismaSchemaFromFile(settings);

  const appContext: AppContext = {
    gql: gqlSchema,
    prisma: prismaSchema,
    tsProject: project,
    settings,
  };

  // Test one rando file
  // await getFileTSInfo(fileToRead, appContext);

  const serviceFilesToLookAt = [] as string[];
  for await (
    const dirEntry of Deno.readDir(
      appContext.settings.apiServicesPath,
    )
  ) {
    // These are generally the folders
    if (dirEntry.isDirectory) {
      const folderPath = path.join(
        appContext.settings.apiServicesPath,
        dirEntry.name,
      );
      // And these are the files in them
      for await (const subdirEntry of Deno.readDir(folderPath)) {
        if (
          subdirEntry.isFile && subdirEntry.name.endsWith(".ts") && !subdirEntry.name.includes(".test.ts") &&
          !subdirEntry.name.includes("scenarios.ts")
        ) {
          serviceFilesToLookAt.push(path.join(folderPath, subdirEntry.name));
        }
      }
    }
  }

  createSharedSchemaFiles(appContext);

  for (const path of serviceFilesToLookAt) {
    await getFileTSInfo(path, appContext);
  }

  console.log(`Updated`, appContext.settings.typesFolderRoot);
}
