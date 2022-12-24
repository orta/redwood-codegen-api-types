import { AppContext } from "../context.ts";
import { getPrismaSchema, graphql as gql, Project } from "../deps.ts";
import { prismaModeller } from "../prismaModeller.ts";
import { lookAtServiceFile } from "../serviceFile.ts";
import { FieldFacts } from "../typeFacts.ts";

type Run = {
  prismaSchema: string;
  services: string;
  sdl: string;
};

export async function getDTSFilesForRun(run: Run) {
  const prisma = getPrismaSchema(run.prismaSchema);
  let gqlSDL = run.sdl;
  if (!gqlSDL.includes("type Query")) gqlSDL += "type Query { _: String }\n";
  if (!gqlSDL.includes("type Mutation")) gqlSDL += "type Mutation { __: String }";

  const schema = gql.buildSchema(gqlSDL);
  const project = new Project({ useInMemoryFileSystem: true });

  const vfs = new Map<string, string>();
  vfs.set("/api/src/services/games.ts", run.services);

  const appContext: AppContext = {
    gql: schema,
    prisma: prismaModeller(prisma),
    tsProject: project,
    fieldFacts: new Map<string, FieldFacts>(),
    settings: {
      root: "/",
      graphQLSchemaPath: "/.redwood/schema.graphql",
      apiServicesPath: "/api/src/services",
      prismaDSLPath: "/api/db/schema.prisma",
      sharedFilename: "shared-schema-types.d.ts",
      sharedInternalFilename: "shared-return-types.d.ts",
      typesFolderRoot: "/types",
    },
    readFile: (path: string | URL) => {
      return Promise.resolve(vfs.get(path.toString()) ?? "");
    },
    writeTextFile: (path: string | URL, data: string) => {
      vfs.set(path.toString(), data);
      return Promise.resolve();
    },
  };

  await lookAtServiceFile("/api/src/services/games.ts", appContext);

  return {
    vfs,
    appContext,
  };
}

export const graphql = (strings: TemplateStringsArray): string => strings[0];
export const prisma = (strings: TemplateStringsArray): string => strings[0];
