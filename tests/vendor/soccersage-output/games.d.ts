import type { GraphQLResolveInfo } from "graphql";
import type { CreateGameInput, UpdateGameInput } from "./shared-schema-types.d.ts";
import type { Game as PGame } from "@prisma/client";

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
