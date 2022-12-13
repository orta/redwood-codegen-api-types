import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { StandingsResult, CreatePredictionInput, UpdatePredictionInput } from "./shared-schema-types";
import type { Prediction as PPrediction, User as PUser, Team as PTeam, Game as PGame } from "@prisma/client";

/** SDL: standings(seasonId: Int!): StandingsResult */
export interface StandingsResolver {
  (args: { seasonId: number }, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): StandingsResult | null | Promise<StandingsResult | null> | (() => Promise<StandingsResult | null>);
}

/** SDL: predictions: [Prediction!]! */
export interface PredictionsResolver {
  (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction[] | Promise<PPrediction[]> | (() => Promise<PPrediction[]>);
}

/** SDL: myPredictions: [Prediction!]! */
export interface MyPredictionsResolver {
  (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction[] | Promise<PPrediction[]> | (() => Promise<PPrediction[]>);
}

/** SDL: prediction(id: Int!): Prediction */
export interface PredictionResolver {
  (args: { id: number }, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction | null | Promise<PPrediction | null> | (() => Promise<PPrediction | null>);
}

/** SDL: createPrediction(input: CreatePredictionInput!): Prediction! */
export interface CreatePredictionResolver {
  (args: { input: CreatePredictionInput }, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction | Promise<PPrediction> | (() => Promise<PPrediction>);
}

/** SDL: updatePrediction(id: Int!, input: UpdatePredictionInput!): Prediction! */
export interface UpdatePredictionResolver {
  (args: { id: number, input: UpdatePredictionInput }, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction | Promise<PPrediction> | (() => Promise<PPrediction>);
}

/** SDL: deletePrediction(id: Int!): Prediction! */
export interface DeletePredictionResolver {
  (args: { id: number }, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction | Promise<PPrediction> | (() => Promise<PPrediction>);
}

type PredictionAsParent = PPrediction & {
  id: () => Promise<number>,
  teamId: () => Promise<number | undefined>,
  gameId: () => Promise<number>,
  userId: () => Promise<number>,
  prediction: () => Promise<string>,
  user: () => Promise<PUser | undefined>,
  team: () => Promise<PTeam | undefined>,
  game: () => Promise<PGame>
};

export interface PredictionTypeResolvers {
  /** SDL: id: Int! */
  id: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number | Promise<number> | (() => Promise<number>);
  /** SDL: teamId: Int */
  teamId: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number | null | Promise<number | null> | (() => Promise<number | null>);
  /** SDL: gameId: Int! */
  gameId: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number | Promise<number> | (() => Promise<number>);
  /** SDL: userId: Int! */
  userId: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number | Promise<number> | (() => Promise<number>);
  /** SDL: prediction: String! */
  prediction: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string | Promise<string> | (() => Promise<string>);
  /** SDL: user: User */
  user: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => PUser | null | Promise<PUser | null> | (() => Promise<PUser | null>);
  /** SDL: team: Team */
  team: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => PTeam | null | Promise<PTeam | null> | (() => Promise<PTeam | null>);
  /** SDL: game: Game! */
  game: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => PGame | Promise<PGame> | (() => Promise<PGame>);
}
