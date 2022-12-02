import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { CreateGameInput, UpdateGameInput } from "./shared-schema-types.d.ts";
import type { Game as PGame, Prediction as PPrediction, Team as PTeam, Season as PSeason } from "@prisma/client";

export interface QGames {
    /** SDL: games: [Game!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame[];
}

export interface QUpcomingGames {
    /** SDL: upcomingGames: [Game!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame[];
}

export interface QGame {
    /** SDL: game(id: Int!): Game */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame | undefined;
}

export interface MCreateGame {
    /** SDL: createGame(input: CreateGameInput!): Game! */
    (args: {input: CreateGameInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame;
}

export interface MUpdateGame {
    /** SDL: updateGame(id: Int!, input: UpdateGameInput!): Game! */
    (args: {id: number, input: UpdateGameInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame;
}

export interface MDeleteGame {
    /** SDL: deleteGame(id: Int!): Game! */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame;
}

type GameAsParent = PGame & { id: () => Promise<number>, 
    seasonId: () => Promise<number>, 
    awayTeamId: () => Promise<number>, 
    homeTeamId: () => Promise<number>, 
    awayTeamScore: () => Promise<number | undefined>, 
    homeTeamScore: () => Promise<number | undefined>, 
    isCompleted: () => Promise<boolean>, 
    startDateTime: () => Promise<DateTime>, 
    predictions: () => Promise<Array<PPrediction | undefined>>, 
    homeTeam: () => Promise<PTeam>, 
    awayTeam: () => Promise<PTeam>, 
    season: () => Promise<PSeason> };

export interface GameResolvers {
    /** SDL: id: Int! */
    id: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number;
    /** SDL: seasonId: Int! */
    seasonId: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number;
    /** SDL: awayTeamId: Int! */
    awayTeamId: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number;
    /** SDL: homeTeamId: Int! */
    homeTeamId: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number;
    /** SDL: awayTeamScore: Int */
    awayTeamScore: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number | undefined;
    /** SDL: homeTeamScore: Int */
    homeTeamScore: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number | undefined;
    /** SDL: isCompleted: Boolean! */
    isCompleted: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => boolean;
    /** SDL: startDateTime: DateTime! */
    startDateTime: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => DateTime;
    /** SDL: predictions: [Prediction]! */
    predictions: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Array<PPrediction | undefined>;
    /** SDL: homeTeam: Team! */
    homeTeam: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => PTeam;
    /** SDL: awayTeam: Team! */
    awayTeam: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => PTeam;
    /** SDL: season: Season! */
    season: (args: {}, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => PSeason;
}

type DateTime = any;
