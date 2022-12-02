import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { CreateTeamInput, UpdateTeamInput } from "./shared-schema-types.d.ts";
import type { Team as PTeam, Prediction as PPrediction, Game as PGame } from "@prisma/client";

export interface QTeams {
    /** SDL: teams: [Team!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam[];
}

export interface QTeam {
    /** SDL: team(id: Int!): Team */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam | undefined;
}

export interface MCreateTeam {
    /** SDL: createTeam(input: CreateTeamInput!): Team! */
    (args: {input: CreateTeamInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam;
}

export interface MUpdateTeam {
    /** SDL: updateTeam(id: Int!, input: UpdateTeamInput!): Team! */
    (args: {id: number, input: UpdateTeamInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam;
}

export interface MDeleteTeam {
    /** SDL: deleteTeam(id: Int!): Team! */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam;
}

type TeamAsParent = PTeam & { id: () => Promise<number>, 
    name: () => Promise<string>, 
    logoUrl: () => Promise<string | undefined>, 
    Prediction: () => Promise<Array<PPrediction | undefined>>, 
    homeTeamGames: () => Promise<Array<PGame | undefined>>, 
    awayTeamGames: () => Promise<Array<PGame | undefined>> };

export interface TeamResolvers {
    /** SDL: id: Int! */
    id: (args: {}, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number;
    /** SDL: name: String! */
    name: (args: {}, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string;
    /** SDL: logoUrl: String */
    logoUrl: (args: {}, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string | undefined;
    /** SDL: Prediction: [Prediction]! */
    Prediction: (args: {}, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Array<PPrediction | undefined>;
    /** SDL: homeTeamGames: [Game]! */
    homeTeamGames: (args: {}, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Array<PGame | undefined>;
    /** SDL: awayTeamGames: [Game]! */
    awayTeamGames: (args: {}, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Array<PGame | undefined>;
}
