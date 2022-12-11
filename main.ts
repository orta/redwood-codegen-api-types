// deno run --allow-all --unstable main.ts
// or watch mode:
// deno run --allow-all --unstable --watch main.ts

import { getPrismaSchema, graphql, path, Project } from "./deps.ts";

import { PrismaMap, prismaModeller } from "./prismaModeller.ts";
import { createSharedSchemaFiles } from "./sharedSchema.ts";
import { AppContext } from "./context.ts";
import { lookAtServiceFile } from "./serviceFile.ts";

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

// FROM:
// Mac
const redwoodProjectRoot = "/Users/orta/dev/puzmo/";
/// Linux
// const redwoodProjectRoot = "/home/orta/dev/puzmo/puzmo/";

// Vendored
// const redwoodProjectRoot =
//   "/Users/orta/dev/redwood-codegen-api-types/tests/vendor/soccersage.io-main";

// TO:

// vendored
// const to =
//   "/Users/orta/dev/redwood-codegen-api-types/tests/vendor/soccersage-output";

// app
const to = "/Users/orta/dev/puzmo/api/src/lib/types";

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
    // typesFolderRoot: "/Users/orta/dev/redwood-codegen-api-types/ignored/puzmo",
    // typesFolderRoot: "/home/orta/dev/puzmo/redwood-codegen-api-types/tests/vendor/soccersage-output",
    typesFolderRoot: to,
  };

  await getGraphQLSDLFromFile(settings);
  await getPrismaSchemaFromFile(settings);

  const appContext: AppContext = {
    gql: gqlSchema!,
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
          subdirEntry.isFile && subdirEntry.name.endsWith(".ts") &&
          !subdirEntry.name.includes(".test.ts") &&
          !subdirEntry.name.includes("scenarios.ts")
        ) {
          serviceFilesToLookAt.push(path.join(folderPath, subdirEntry.name));
        }
      }
    }
  }

  // empty the types folder
  for await (
    const dirEntry of Deno.readDir(appContext.settings.typesFolderRoot)
  ) {
    if (dirEntry.isFile) {
      await Deno.remove(
        path.join(appContext.settings.typesFolderRoot, dirEntry.name),
      );
    }
  }

  createSharedSchemaFiles(appContext);

  for (const path of serviceFilesToLookAt) {
    await lookAtServiceFile(path, appContext);
  }

  console.log(`Updated`, appContext.settings.typesFolderRoot);
}
