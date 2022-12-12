## Alternative Types Generator for Redwood Projects

Redwood's type generation is pretty reasonable for most projects, but I've found after ~15 months of using Redwood when I turned on TypeScript's strict mode, I've never once got to 0 compiler warnings and performance for auto-complete/errors is not great.

This... is a mixed bag, I'm reasonably sure that the runtime code is right but I've really been fighting hard to understand compiler errors due to the extreme flexibility in the types generated by [graphql-codegen](https://the-guild.dev/graphql/codegen) and it kept feeling like I was applying too much type-foo which would be harder for others to understand and maintain.

So, this project is what I have been referring to as 'relay style' types codegen, where each service in the Redwood project gets its own `.d.ts` file which is hyper specific - taking into account the resolvers defined, the GraphQL schema and the types from Prisma.

I like to think of it as taking all of the work which happens in the type system, from types like:

```ts
export type AccountRelationResolvers<
  ContextType = RedwoodGraphQLContext,
  ParentType extends ResolversParentTypes["Account"] = ResolversParentTypes["Account"]
> = {
  createdAt?: RequiredResolverFn<
    ResolversTypes["DateTime"],
    ParentType,
    ContextType
  >;
  email?: RequiredResolverFn<ResolversTypes["String"], ParentType, ContextType>;
  users?: RequiredResolverFn<
    Array<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
};

export type ResolversParentTypes = {
  Account: MergePrismaWithSdlTypes<
    PrismaAccount,
    MakeRelationsOptional<Account, AllMappedModels>,
    AllMappedModels
  >;
};

// ...
```

and manually applies them, with an understanding of how Redwood works to just be the outcome:

```ts
import type { Account as PAccount, User as PUser } from "@prisma/client";

type AccountAsParent = PAccount & { users: () => Promise<PUser[]> };

export interface AccountTypeResolvers {
  /** SDL: users: [User!]! */
  users: (
    args: undefined,
    obj: {
      root: AccountAsParent;
      context: RedwoodGraphQLContext;
      info: GraphQLResolveInfo;
    }
  ) => PUser[] | Promise<PUser[]> | (() => Promise<PUser[]>);
}
```

Obviously this is considerably less flexible than before, but the goal is to be exactly what I need for my large Redwood project and then if folks are interested in the same problems, we can collab on making it more flexible.

I'm not really sure it makes sense for the Redwood team to think about upstreaming the changes, mainly because there's a bunch of codebases out there with all sorts of edge cases - and I don't have time to deal with other people's edge cases.

---

ATM it is a deno script, which generates a suite of .d.ts files. With time, I'd expect it to trigger a runtime server which uses watchman to incrementally update your types as your app changes.

---

This is a work in progress, which isn't seeing active use in my main redwood app yet - but it's getting close.

You can see what it looks like when running on a small, but real, Redwood project here:

- [app](tests/vendor/soccersage.io-main)
- [generated types](tests/vendor/soccersage-output)

## How to work in this repo

- Install deno
- Clone the repo
- Run `deno task dev` to start the dev server

The dev server will re-run against the fixtures in `tests/vendor`, you can use git to work with the diff.

You can make a `.env` in the root, and the dev server will _also_ run against these paths:

```
MAIN_APP_PATH="/home/orta/dev/app/"
MAIN_TYPES_DEPLOY="/home/orta/dev/redwood-codegen-api-types/ignored/"
```

## Done

- Generating a shared library of types for the whole schema (for referencing inside your resolvers)
- Query / Mutation resolvers are correctly typed
- Comments from Prisma file, and SDL are included in the generated types
- Resolvers on specific models need to be added
- Create an internal representation of a GQL type which adds an optional marker to resolvers defined in the file.

## TODO

- Feel good that all [these types](https://github.com/redwoodjs/redwood/pull/6228) are accounted for
- Tests (I've added some fixtures, but I'm mostly testing by running against my main app )
- Create an 'unuused resolvers' interface for auto-complete on the main type resolvers?
