## Alternative Types Generator for Redwood Projects

Redwood's type generation is pretty reasonable for most projects, but I've found after ~15 months of using Redwood when I turned on TypeScript's script mode, I've never once got to 0 compiler warnings.

This... is a mixed bag, I'm reasonably sure that the runtime code is right but I've really been fighting hard to understand compiler errors due to the extreme flexibility in the types generated by [graphql-codegen](https://the-guild.dev/graphql/codegen) and it kept feeling like I was applying too much type-foo which would be harder for others to understand and maintain.

So, this project is what I have been referring to as 'relay style' types codegen, where each service in the Redwood project gets its own `.d.ts` file which is hyper specific - taking into account the resolvers defined, the GraphQL schema and the types from Prisma.

ATM it is a deno script, which generates a suite of .d.ts files. With time, I'd expect it to trigger a runtime server which uses watchman to incrementally update your types as your app changes.

---

This is a work in progress, which isn't seeing active use in my main redwood app yet - but it's getting close.

You can see what it looks like when running on a small, but real, Redwood project here:

- [app](tests/vendor/soccersage.io-main)
- [generated types](tests/vendor/soccersage-output)

## Done

- Generating a shared library of types for the whole schema (for referencing inside your resolvers)
- Query / Mutation resolvers are correctly typed

## TODO

- Resolvers on specific models need to be added
- Types for things like parents need to take into account known resolvers which are declared in a service, and force them to be optional
- Tests (I've added some fixtures, but I'm mostly testing by running against my main app )
