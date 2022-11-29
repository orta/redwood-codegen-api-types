import { graphql, tsMorph } from "./deps.ts";
import { PrismaMap } from "./prismaModeller.ts";

export type AppContext = {
  gql: graphql.GraphQLSchema;
  prisma: PrismaMap;
  tsProject: tsMorph.Project;
  settings: {
    sharedFilename: string;
  };
};
