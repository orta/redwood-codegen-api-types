import type { GraphQLResolveInfo } from "graphql";
import type { CreateTeamInput, UpdateTeamInput } from "./shared-schema-types.d.ts";
import type { Team as PTeam } from "@prisma/client";

export interface QTeams {
    /** SDL: teams: [Team!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam[];
}

export interface QTeam {
    /** SDL: team(id: Int!): Team */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam | undefined;
}

export interface MCreateTeam {
    /** SDL: createTeam(input: CreateTeamInput!): Team! */
    (args: {input: CreateTeamInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam;
}

export interface MUpdateTeam {
    /** SDL: updateTeam(id: Int!, input: UpdateTeamInput!): Team! */
    (args: {id: number, input: UpdateTeamInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam;
}

export interface MDeleteTeam {
    /** SDL: deleteTeam(id: Int!): Team! */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PTeam;
}
