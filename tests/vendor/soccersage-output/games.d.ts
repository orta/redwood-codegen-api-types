import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { CreateGameInput, UpdateGameInput } from "./shared-schema-types";
import type { Game as PGame, Prediction as PPrediction, Team as PTeam, Season as PSeason } from "@prisma/client";

export interface QGames {
    /** SDL: games: [Game!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame[] | Promise<PGame[]> | () => Promise<PGame[]> ;
}

export interface QUpcomingGames {
    /** SDL: upcomingGames: [Game!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame[] | Promise<PGame[]> | () => Promise<PGame[]> ;
}

export interface QGame {
    /** SDL: game(id: Int!): Game */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame | undefined | Promise<PGame | undefined> | () => Promise<PGame | undefined> ;
}

export interface MCreateGame {
    /** SDL: createGame(input: CreateGameInput!): Game! */
    (args: {input: CreateGameInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame | Promise<PGame> | () => Promise<PGame> ;
}

export interface MUpdateGame {
    /** SDL: updateGame(id: Int!, input: UpdateGameInput!): Game! */
    (args: {id: number, input: UpdateGameInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame | Promise<PGame> | () => Promise<PGame> ;
}

export interface MDeleteGame {
    /** SDL: deleteGame(id: Int!): Game! */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PGame | Promise<PGame> | () => Promise<PGame> ;
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
    id: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number> | number;
    /** SDL: seasonId: Int! */
    seasonId: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number> | number;
    /** SDL: awayTeamId: Int! */
    awayTeamId: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number> | number;
    /** SDL: homeTeamId: Int! */
    homeTeamId: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number> | number;
    /** SDL: awayTeamScore: Int */
    awayTeamScore: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number | undefined> | number | undefined;
    /** SDL: homeTeamScore: Int */
    homeTeamScore: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number | undefined> | number | undefined;
    /** SDL: isCompleted: Boolean! */
    isCompleted: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<boolean> | boolean;
    /** SDL: startDateTime: DateTime! */
    startDateTime: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<DateTime> | DateTime;
    /** SDL: predictions: [Prediction]! */
    predictions: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<Array<PPrediction | undefined>> | Array<PPrediction | undefined>;
    /** SDL: homeTeam: Team! */
    homeTeam: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<PTeam> | PTeam;
    /** SDL: awayTeam: Team! */
    awayTeam: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<PTeam> | PTeam;
    /** SDL: season: Season! */
    season: (args: undefined, obj: { root: GameAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<PSeason> | PSeason;
}

type DateTime = any;
