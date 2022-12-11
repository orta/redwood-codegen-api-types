import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { CreateGameInput, UpdateGameInput } from "./shared-schema-types";
import type { Game as PGame, Prediction as PPrediction, Season as PSeason, Team as PTeam } from "@prisma/client";

/** SDL: games: [Game!]! */
export interface QGames {
  (
    args: {},
    obj: { root: {}; context: RedwoodGraphQLContext; info: GraphQLResolveInfo },
  ): PGame[] | Promise<PGame[]> | (() => Promise<PGame[]>);
}

/** SDL: upcomingGames: [Game!]! */
export interface QUpcomingGames {
  (
    args: {},
    obj: { root: {}; context: RedwoodGraphQLContext; info: GraphQLResolveInfo },
  ): PGame[] | Promise<PGame[]> | (() => Promise<PGame[]>);
}

/** SDL: game(id: Int!): Game */
export interface QGame {
  (
    args: { id: number },
    obj: { root: {}; context: RedwoodGraphQLContext; info: GraphQLResolveInfo },
  ): PGame | undefined | Promise<PGame | undefined> | (() => Promise<PGame | undefined>);
}

/** SDL: createGame(input: CreateGameInput!): Game! */
export interface MCreateGame {
  (
    args: { input: CreateGameInput },
    obj: { root: {}; context: RedwoodGraphQLContext; info: GraphQLResolveInfo },
  ): PGame | Promise<PGame> | (() => Promise<PGame>);
}

/** SDL: updateGame(id: Int!, input: UpdateGameInput!): Game! */
export interface MUpdateGame {
  (
    args: { id: number; input: UpdateGameInput },
    obj: { root: {}; context: RedwoodGraphQLContext; info: GraphQLResolveInfo },
  ): PGame | Promise<PGame> | (() => Promise<PGame>);
}

/** SDL: deleteGame(id: Int!): Game! */
export interface MDeleteGame {
  (
    args: { id: number },
    obj: { root: {}; context: RedwoodGraphQLContext; info: GraphQLResolveInfo },
  ): PGame | Promise<PGame> | (() => Promise<PGame>);
}

type GameAsParent = PGame & {
  predictions: () => Promise<Array<PPrediction | undefined>>;
  homeTeam: () => Promise<PTeam>;
  awayTeam: () => Promise<PTeam>;
  season: () => Promise<PSeason>;
};

export interface GameResolvers {
  /** SDL: predictions: [Prediction]! */
  predictions: (
    args: undefined,
    obj: { root: GameAsParent; context: RedwoodGraphQLContext; info: GraphQLResolveInfo },
  ) => Promise<Array<PPrediction | undefined>> | Array<PPrediction | undefined>;
  /** SDL: homeTeam: Team! */
  homeTeam: (
    args: undefined,
    obj: { root: GameAsParent; context: RedwoodGraphQLContext; info: GraphQLResolveInfo },
  ) => Promise<PTeam> | PTeam;
  /** SDL: awayTeam: Team! */
  awayTeam: (
    args: undefined,
    obj: { root: GameAsParent; context: RedwoodGraphQLContext; info: GraphQLResolveInfo },
  ) => Promise<PTeam> | PTeam;
  /** SDL: season: Season! */
  season: (
    args: undefined,
    obj: { root: GameAsParent; context: RedwoodGraphQLContext; info: GraphQLResolveInfo },
  ) => Promise<PSeason> | PSeason;
}
