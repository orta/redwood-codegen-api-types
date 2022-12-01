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
