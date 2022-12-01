import type { GraphQLResolveInfo } from "graphql";
import type { StandingsResult, CreatePredictionInput, UpdatePredictionInput } from "./shared-schema-types.d.ts";
import type { Prediction as PPrediction } from "@prisma/client";

export interface QStandings {
    /** SDL: standings(seasonId: Int!): StandingsResult */
    (args: {seasonId: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): StandingsResult | undefined;
}

export interface QPredictions {
    /** SDL: predictions: [Prediction!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction[];
}

export interface QMyPredictions {
    /** SDL: myPredictions: [Prediction!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction[];
}

export interface QPrediction {
    /** SDL: prediction(id: Int!): Prediction */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction | undefined;
}

export interface MCreatePrediction {
    /** SDL: createPrediction(input: CreatePredictionInput!): Prediction! */
    (args: {input: CreatePredictionInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction;
}

export interface MUpdatePrediction {
    /** SDL: updatePrediction(id: Int!, input: UpdatePredictionInput!): Prediction! */
    (args: {id: number, input: UpdatePredictionInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction;
}

export interface MDeletePrediction {
    /** SDL: deletePrediction(id: Int!): Prediction! */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PPrediction;
}
