import type { GraphQLResolveInfo } from "graphql";
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

export interface UserResolvers {
    /** SDL: id: Int! */
    id: () => number;
    /** SDL: email: String! */
    email: () => string;
    /** SDL: username: String! */
    username: () => string;
    /** SDL: hashedPassword: String! */
    hashedPassword: () => string;
    /** SDL: resetToken: String */
    resetToken: () => string | undefined;
    /** SDL: resetTokenExpiresAt: DateTime */
    resetTokenExpiresAt: () => DateTime | undefined;
    /** SDL: salt: String! */
    salt: () => string;
    /** SDL: roles: String! */
    roles: () => string;
    /** SDL: predictions: [Prediction]! */
    predictions: () => Array<PPrediction | undefined>;
}

type DateTime = any;
