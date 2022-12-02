import type { GraphQLResolveInfo } from "graphql";
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

export interface GameResolvers {
    /** SDL: id: Int! */
    id: () => number;
    /** SDL: seasonId: Int! */
    seasonId: () => number;
    /** SDL: awayTeamId: Int! */
    awayTeamId: () => number;
    /** SDL: homeTeamId: Int! */
    homeTeamId: () => number;
    /** SDL: awayTeamScore: Int */
    awayTeamScore: () => number | undefined;
    /** SDL: homeTeamScore: Int */
    homeTeamScore: () => number | undefined;
    /** SDL: isCompleted: Boolean! */
    isCompleted: () => boolean;
    /** SDL: startDateTime: DateTime! */
    startDateTime: () => DateTime;
    /** SDL: predictions: [Prediction]! */
    predictions: () => Array<PPrediction | undefined>;
    /** SDL: homeTeam: Team! */
    homeTeam: () => PTeam;
    /** SDL: awayTeam: Team! */
    awayTeam: () => PTeam;
    /** SDL: season: Season! */
    season: () => PSeason;
}

type DateTime = any;
