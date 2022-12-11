import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { StandingsResult, CreatePredictionInput, UpdatePredictionInput } from "./shared-schema-types";
import type { Prediction as PPrediction, User as PUser, Team as PTeam, Game as PGame } from "@prisma/client";

export interface QStandings {
    /** SDL: standings(seasonId: Int!): StandingsResult */
    (args: {seasonId: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): StandingsResult | undefined | Promise<StandingsResult | undefined> | () => Promise<StandingsResult | undefined> ;
}

export interface QPredictions {
    /** SDL: predictions: [Prediction!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction[] | Promise<PPrediction[]> | () => Promise<PPrediction[]> ;
}

export interface QMyPredictions {
    /** SDL: myPredictions: [Prediction!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction[] | Promise<PPrediction[]> | () => Promise<PPrediction[]> ;
}

export interface QPrediction {
    /** SDL: prediction(id: Int!): Prediction */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction | undefined | Promise<PPrediction | undefined> | () => Promise<PPrediction | undefined> ;
}

export interface MCreatePrediction {
    /** SDL: createPrediction(input: CreatePredictionInput!): Prediction! */
    (args: {input: CreatePredictionInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction | Promise<PPrediction> | () => Promise<PPrediction> ;
}

export interface MUpdatePrediction {
    /** SDL: updatePrediction(id: Int!, input: UpdatePredictionInput!): Prediction! */
    (args: {id: number, input: UpdatePredictionInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction | Promise<PPrediction> | () => Promise<PPrediction> ;
}

export interface MDeletePrediction {
    /** SDL: deletePrediction(id: Int!): Prediction! */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction | Promise<PPrediction> | () => Promise<PPrediction> ;
}

type PredictionAsParent = PPrediction & { id: () => Promise<number>, 
    teamId: () => Promise<number | undefined>, 
    gameId: () => Promise<number>, 
    userId: () => Promise<number>, 
    prediction: () => Promise<string>, 
    user: () => Promise<PUser | undefined>, 
    team: () => Promise<PTeam | undefined>, 
    game: () => Promise<PGame> };

export interface PredictionResolvers {
    /** SDL: id: Int! */
    id: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number> | number;
    /** SDL: teamId: Int */
    teamId: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number | undefined> | number | undefined;
    /** SDL: gameId: Int! */
    gameId: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number> | number;
    /** SDL: userId: Int! */
    userId: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number> | number;
    /** SDL: prediction: String! */
    prediction: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<string> | string;
    /** SDL: user: User */
    user: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<PUser | undefined> | PUser | undefined;
    /** SDL: team: Team */
    team: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<PTeam | undefined> | PTeam | undefined;
    /** SDL: game: Game! */
    game: (args: undefined, obj: { root: PredictionAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<PGame> | PGame;
}
