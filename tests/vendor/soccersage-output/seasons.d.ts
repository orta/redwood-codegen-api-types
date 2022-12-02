import type { GraphQLResolveInfo } from "graphql";
import type { CreateSeasonInput, UpdateSeasonInput } from "./shared-schema-types.d.ts";
import type { Season as PSeason, Prediction as PPrediction } from "@prisma/client";

export interface QSeasons {
    /** SDL: seasons: [Season!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason[];
}

export interface QSeason {
    /** SDL: season(id: Int!): Season */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason | undefined;
}

export interface MCreateSeason {
    /** SDL: createSeason(input: CreateSeasonInput!): Season! */
    (args: {input: CreateSeasonInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason;
}

export interface MUpdateSeason {
    /** SDL: updateSeason(id: Int!, input: UpdateSeasonInput!): Season! */
    (args: {id: number, input: UpdateSeasonInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason;
}

export interface MDeleteSeason {
    /** SDL: deleteSeason(id: Int!): Season! */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason;
}

export interface SeasonResolvers {
    /** SDL: id: Int! */
    id: () => number;
    /** SDL: name: String! */
    name: () => string;
    /** SDL: startDate: DateTime! */
    startDate: () => DateTime;
    /** SDL: endDate: DateTime! */
    endDate: () => DateTime;
    /** SDL: Prediction: [Prediction]! */
    Prediction: () => Array<PPrediction | undefined>;
}

type DateTime = any;
