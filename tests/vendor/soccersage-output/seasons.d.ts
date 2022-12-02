import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
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

type SeasonAsParent = PSeason & { id: () => Promise<number>, 
    name: () => Promise<string>, 
    startDate: () => Promise<DateTime>, 
    endDate: () => Promise<DateTime>, 
    Prediction: () => Promise<Array<PPrediction | undefined>> };

export interface SeasonResolvers {
    /** SDL: id: Int! */
    id: (args: {}, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number;
    /** SDL: name: String! */
    name: (args: {}, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string;
    /** SDL: startDate: DateTime! */
    startDate: (args: {}, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => DateTime;
    /** SDL: endDate: DateTime! */
    endDate: (args: {}, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => DateTime;
    /** SDL: Prediction: [Prediction]! */
    Prediction: (args: {}, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Array<PPrediction | undefined>;
}

type DateTime = any;
