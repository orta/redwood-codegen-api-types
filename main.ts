// deno run --allow-all --unstable main.ts
// or watch mode:
// deno run --allow-all --unstable --watch main.ts

import { dotenv, getPrismaSchema, graphql, path, Project } from "./deps.ts";
import { PrismaMap, prismaModeller } from "./prismaModeller.ts";
import { createSharedSchemaFiles } from "./sharedSchema.ts";
import { AppContext } from "./context.ts";
import { lookAtServiceFile } from "./serviceFile.ts";
import { FieldFacts } from "./typeFacts.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if ((import.meta as any).main) {
  Deno.stdout.write(new TextEncoder().encode("\x1b[2J"));
  console.log("-----------------------\n");

  const appRoot = Deno.cwd();
  const vendorSrcRoot = path.join(appRoot, "tests", "vendor", "soccersage.io-main");
  const vendorTypesRoot = path.join(appRoot, "tests", "vendor", "soccersage-output");
  await run(vendorSrcRoot, vendorTypesRoot);

  const cfg = await dotenv.config({});
  if (cfg["MAIN_APP_PATH"]) {
    const appRoot = cfg["MAIN_APP_PATH"];
    const typesRoot = cfg["MAIN_TYPES_DEPLOY"];
    await run(appRoot, typesRoot);
  }
}

async function run(appRoot: string, typesRoot: string) {
  const project = new Project({ useInMemoryFileSystem: true });

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

  const settings: AppContext["settings"] = {
    root: appRoot,
    graphQLSchemaPath: path.join(
      appRoot,
      ".redwood",
      "schema.graphql",
    ),
    apiServicesPath: path.join(appRoot, "api", "src", "services"),
    prismaDSLPath: path.join(appRoot, "api", "db", "schema.prisma"),
    sharedFilename: "shared-schema-types.d.ts",
    typesFolderRoot: typesRoot,
  };

  await getGraphQLSDLFromFile(settings);
  await getPrismaSchemaFromFile(settings);

  const appContext: AppContext = {
    gql: gqlSchema!,
    prisma: prismaSchema,
    tsProject: project,
    fieldFacts: new Map<string, FieldFacts>(),
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

  // This needs to go first, as it sets up fieldFacts
  for (const path of serviceFilesToLookAt) {
    await lookAtServiceFile(path, appContext);
  }

  createSharedSchemaFiles(appContext);

  console.log(`Updated`, appContext.settings.typesFolderRoot);
}
