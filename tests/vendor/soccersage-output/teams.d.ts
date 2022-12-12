import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { CreateTeamInput, UpdateTeamInput } from "./shared-schema-types";
import type { Team as PTeam, Prediction as PPrediction, Game as PGame } from "@prisma/client";

/** SDL: teams: [Team!]! */
export interface QTeams {
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam[] | Promise<PTeam[]> | (() => Promise<PTeam[]>);
}

/** SDL: team(id: Int!): Team */
export interface QTeam {
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam| null | Promise<PTeam| null> | (() => Promise<PTeam| null>);
}

/** SDL: createTeam(input: CreateTeamInput!): Team! */
export interface MCreateTeam {
    (args: {input: CreateTeamInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam | Promise<PTeam> | (() => Promise<PTeam>);
}

/** SDL: updateTeam(id: Int!, input: UpdateTeamInput!): Team! */
export interface MUpdateTeam {
    (args: {id: number, input: UpdateTeamInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam | Promise<PTeam> | (() => Promise<PTeam>);
}

/** SDL: deleteTeam(id: Int!): Team! */
export interface MDeleteTeam {
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam | Promise<PTeam> | (() => Promise<PTeam>);
}

type TeamAsParent = PTeam & { id: () => Promise<number>, 
    name: () => Promise<string>, 
    logoUrl: () => Promise<string | undefined>, 
    Prediction: () => Promise<Array<PPrediction>>, 
    homeTeamGames: () => Promise<Array<PGame>>, 
    awayTeamGames: () => Promise<Array<PGame>> };

export interface TeamResolvers {
    /** SDL: id: Int! */
    id: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number | Promise<number> | (() => Promise<number>);
    /** SDL: name: String! */
    name: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string | Promise<string> | (() => Promise<string>);
    /** SDL: logoUrl: String */
    logoUrl: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string| null | Promise<string| null> | (() => Promise<string| null>);
    /** SDL: Prediction: [Prediction]! */
    Prediction: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Array<PPrediction> | Promise<Array<PPrediction>> | (() => Promise<Array<PPrediction>>);
    /** SDL: homeTeamGames: [Game]! */
    homeTeamGames: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Array<PGame> | Promise<Array<PGame>> | (() => Promise<Array<PGame>>);
    /** SDL: awayTeamGames: [Game]! */
    awayTeamGames: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Array<PGame> | Promise<Array<PGame>> | (() => Promise<Array<PGame>>);
}
