import type { GraphQLResolveInfo } from "graphql";
import type { CreateSeasonInput, UpdateSeasonInput } from "./shared-schema-types.d.ts";
import type { Season as PSeason } from "@prisma/client";

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
