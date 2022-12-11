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
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam | undefined | Promise<PTeam | undefined> | (() => Promise<PTeam | undefined>);
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
    Prediction: () => Promise<Array<PPrediction | undefined>>, 
    homeTeamGames: () => Promise<Array<PGame | undefined>>, 
    awayTeamGames: () => Promise<Array<PGame | undefined>> };

export interface TeamResolvers {
    /** SDL: id: Int! */
    id: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number> | number;
    /** SDL: name: String! */
    name: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<string> | string;
    /** SDL: logoUrl: String */
    logoUrl: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<string | undefined> | string | undefined;
    /** SDL: Prediction: [Prediction]! */
    Prediction: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<Array<PPrediction | undefined>> | Array<PPrediction | undefined>;
    /** SDL: homeTeamGames: [Game]! */
    homeTeamGames: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<Array<PGame | undefined>> | Array<PGame | undefined>;
    /** SDL: awayTeamGames: [Game]! */
    awayTeamGames: (args: undefined, obj: { root: TeamAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<Array<PGame | undefined>> | Array<PGame | undefined>;
}
