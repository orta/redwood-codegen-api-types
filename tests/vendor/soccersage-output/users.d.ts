import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";
import type { CreateUserInput, UpdateUserInput, SuccessInput } from "./shared-schema-types";
import type { User as PUser, Prediction as PPrediction } from "@prisma/client";

/** SDL: users: [User!]! */
export interface QUsers {
    (args: {}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser[] | Promise<PUser[]> | (() => Promise<PUser[]>);
}

/** SDL: user(id: Int!): User */
export interface QUser {
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser | undefined | Promise<PUser | undefined> | (() => Promise<PUser | undefined>);
}

/** SDL: createUser(input: CreateUserInput!): User! */
export interface MCreateUser {
    (args: {input: CreateUserInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser | Promise<PUser> | (() => Promise<PUser>);
}

/** SDL: updateUser(id: Int!, input: UpdateUserInput!): User! */
export interface MUpdateUser {
    (args: {id: number, input: UpdateUserInput}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser | Promise<PUser> | (() => Promise<PUser>);
}

/** SDL: deleteUser(id: Int!): User! */
export interface MDeleteUser {
    (args: {id: number}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser | Promise<PUser> | (() => Promise<PUser>);
}

/** SDL: sendResetPasswordEmail(email: String!): SuccessInput */
export interface MSendResetPasswordEmail {
    (args: {email: string}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): SuccessInput | undefined | Promise<SuccessInput | undefined> | (() => Promise<SuccessInput | undefined>);
}

/** SDL: resetPassword(password: String!, resetToken: String!): User! */
export interface MResetPassword {
    (args: {password: string, resetToken: string}, obj: { root: {}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }): PUser | Promise<PUser> | (() => Promise<PUser>);
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
    id: (args: undefined, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<number> | number;
    /** SDL: email: String! */
    email: (args: undefined, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<string> | string;
    /** SDL: username: String! */
    username: (args: undefined, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<string> | string;
    /** SDL: hashedPassword: String! */
    hashedPassword: (args: undefined, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<string> | string;
    /** SDL: resetToken: String */
    resetToken: (args: undefined, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<string | undefined> | string | undefined;
    /** SDL: resetTokenExpiresAt: DateTime */
    resetTokenExpiresAt: (args: undefined, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<DateTime | undefined> | DateTime | undefined;
    /** SDL: salt: String! */
    salt: (args: undefined, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<string> | string;
    /** SDL: roles: String! */
    roles: (args: undefined, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<string> | string;
    /** SDL: predictions: [Prediction]! */
    predictions: (args: undefined, obj: { root: UserAsParent, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }) => Promise<Array<PPrediction | undefined>> | Array<PPrediction | undefined>;
}

type DateTime = any;
