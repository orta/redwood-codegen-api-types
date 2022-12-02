import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { CreateUserInput, UpdateUserInput, SuccessInput } from "./shared-schema-types.d.ts";
import type { User as PUser, Prediction as PPrediction } from "@prisma/client";

export interface QUsers {
    /** SDL: users: [User!]! */
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser[];
}

export interface QUser {
    /** SDL: user(id: Int!): User */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser | undefined;
}

export interface MCreateUser {
    /** SDL: createUser(input: CreateUserInput!): User! */
    (args: {input: CreateUserInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser;
}

export interface MUpdateUser {
    /** SDL: updateUser(id: Int!, input: UpdateUserInput!): User! */
    (args: {id: number, input: UpdateUserInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser;
}

export interface MDeleteUser {
    /** SDL: deleteUser(id: Int!): User! */
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser;
}

export interface MSendResetPasswordEmail {
    /** SDL: sendResetPasswordEmail(email: String!): SuccessInput */
    (args: {email: string}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): SuccessInput | undefined;
}

export interface MResetPassword {
    /** SDL: resetPassword(password: String!, resetToken: String!): User! */
    (args: {password: string, resetToken: string}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser;
}

type UserAsParent = PUser & { id: () => Promise<number>, 
    email: () => Promise<string>, 
    username: () => Promise<string>, 
    hashedPassword: () => Promise<string>, 
    resetToken: () => Promise<string | undefined>, 
    resetTokenExpiresAt: () => Promise<DateTime | undefined>, 
    salt: () => Promise<string>, 
    roles: () => Promise<string>, 
    predictions: () => Promise<Array<PPrediction | undefined>> };

export interface UserResolvers {
    /** SDL: id: Int! */
    id: (args: {}, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => number;
    /** SDL: email: String! */
    email: (args: {}, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string;
    /** SDL: username: String! */
    username: (args: {}, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string;
    /** SDL: hashedPassword: String! */
    hashedPassword: (args: {}, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string;
    /** SDL: resetToken: String */
    resetToken: (args: {}, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string | undefined;
    /** SDL: resetTokenExpiresAt: DateTime */
    resetTokenExpiresAt: (args: {}, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => DateTime | undefined;
    /** SDL: salt: String! */
    salt: (args: {}, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string;
    /** SDL: roles: String! */
    roles: (args: {}, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => string;
    /** SDL: predictions: [Prediction]! */
    predictions: (args: {}, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Array<PPrediction | undefined>;
}

type DateTime = any;
