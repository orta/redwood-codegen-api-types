export { parse } from "https://deno.land/std@0.166.0/flags/mod.ts";
export * as path from "https://deno.land/std@0.166.0/path/mod.ts";
export * as dotenv from "https://deno.land/std@0.166.0/dotenv/mod.ts";

// export * as Watchmano from "https://deno.land/x/watchman/mod.ts";
export { Project } from "https://deno.land/x/ts_morph/mod.ts";
export * as tsMorph from "https://deno.land/x/ts_morph/mod.ts";

export * as graphql from "npm:graphql@^16";
// export * as watchman from "npm:fb-watchman@2.0.2";

export type { Node } from "npm:typescript@^4.9";
export { getSchema as getPrismaSchema } from "npm:@mrleebo/prisma-ast@0.4.1";
export type { Model as PrismaModel, Property as PrismaProperty, Schema as PrismaSchemaBlocks } from "npm:@mrleebo/prisma-ast@0.4.1";
