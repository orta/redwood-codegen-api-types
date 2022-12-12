import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { CreateSeasonInput, UpdateSeasonInput } from "./shared-schema-types";
import type { Season as PSeason, Prediction as PPrediction } from "@prisma/client";

/** SDL: seasons: [Season!]! */
export interface SeasonsResolver {
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason[] | Promise<PSeason[]> | (() => Promise<PSeason[]>);
}

/** SDL: season(id: Int!): Season */
export interface SeasonResolver {
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason| null | Promise<PSeason| null> | (() => Promise<PSeason| null>);
}

/** SDL: createSeason(input: CreateSeasonInput!): Season! */
export interface CreateSeasonResolver {
    (args: {input: CreateSeasonInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason | Promise<PSeason> | (() => Promise<PSeason>);
}

/** SDL: updateSeason(id: Int!, input: UpdateSeasonInput!): Season! */
export interface UpdateSeasonResolver {
    (args: {id: number, input: UpdateSeasonInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason | Promise<PSeason> | (() => Promise<PSeason>);
}

/** SDL: deleteSeason(id: Int!): Season! */
export interface DeleteSeasonResolver {
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason | Promise<PSeason> | (() => Promise<PSeason>);
}

type SeasonAsParent = PSeason & { id: () => Promise<number>, 
    name: () => Promise<string>, 
    startDate: () => Promise<DateTime>, 
    endDate: () => Promise<DateTime>, 
    Prediction: () => Promise<Array<PPrediction>> };

export interface SeasonTypeResolvers {
    /** SDL: id: Int! */
    id: (args: undefined, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number | Promise<number> | (() => Promise<number>);
    /** SDL: name: String! */
    name: (args: undefined, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string | Promise<string> | (() => Promise<string>);
    /** SDL: startDate: DateTime! */
    startDate: (args: undefined, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => DateTime | Promise<DateTime> | (() => Promise<DateTime>);
    /** SDL: endDate: DateTime! */
    endDate: (args: undefined, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => DateTime | Promise<DateTime> | (() => Promise<DateTime>);
    /** SDL: Prediction: [Prediction]! */
    Prediction: (args: undefined, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Array<PPrediction> | Promise<Array<PPrediction>> | (() => Promise<Array<PPrediction>>);
}

type DateTime = any;
