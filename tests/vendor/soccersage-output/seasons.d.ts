import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { CreateSeasonInput, UpdateSeasonInput } from "./shared-schema-types";
import type { Season as PSeason, Prediction as PPrediction } from "@prisma/client";

export interface QSeasons {
    /** SDL: seasons: [Season!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason[] | Promise<PSeason[]> | () => Promise<PSeason[]> ;
}

export interface QSeason {
    /** SDL: season(id: Int!): Season */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason | undefined | Promise<PSeason | undefined> | () => Promise<PSeason | undefined> ;
}

export interface MCreateSeason {
    /** SDL: createSeason(input: CreateSeasonInput!): Season! */
    (args: {input: CreateSeasonInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason | Promise<PSeason> | () => Promise<PSeason> ;
}

export interface MUpdateSeason {
    /** SDL: updateSeason(id: Int!, input: UpdateSeasonInput!): Season! */
    (args: {id: number, input: UpdateSeasonInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason | Promise<PSeason> | () => Promise<PSeason> ;
}

export interface MDeleteSeason {
    /** SDL: deleteSeason(id: Int!): Season! */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PSeason | Promise<PSeason> | () => Promise<PSeason> ;
}

type SeasonAsParent = PSeason & { id: () => Promise<number>, 
    name: () => Promise<string>, 
    startDate: () => Promise<DateTime>, 
    endDate: () => Promise<DateTime>, 
    Prediction: () => Promise<Array<PPrediction | undefined>> };

export interface SeasonResolvers {
    /** SDL: id: Int! */
    id: (args: undefined, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number> | number;
    /** SDL: name: String! */
    name: (args: undefined, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<string> | string;
    /** SDL: startDate: DateTime! */
    startDate: (args: undefined, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<DateTime> | DateTime;
    /** SDL: endDate: DateTime! */
    endDate: (args: undefined, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<DateTime> | DateTime;
    /** SDL: Prediction: [Prediction]! */
    Prediction: (args: undefined, obj: { root: SeasonAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<Array<PPrediction | undefined>> | Array<PPrediction | undefined>;
}

type DateTime = any;
