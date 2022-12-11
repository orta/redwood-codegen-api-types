import { graphql, tsMorph } from "./deps.ts";
import { PrismaMap } from "./prismaModeller.ts";
import { FieldFacts } from "./typeFacts.ts";

export type AppContext = {
  gql: graphql.GraphQLSchema;
  prisma: PrismaMap;
  tsProject: tsMorph.Project;
  fieldFacts: Map<string, FieldFacts>;
  settings: {
    root: string;
    graphQLSchemaPath: string;
    apiServicesPath: string;
    sharedFilename: string;
    prismaDSLPath: string;
    typesFolderRoot: string;
  };
};
