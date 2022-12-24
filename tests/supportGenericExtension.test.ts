import { assertStringIncludes } from "https://deno.land/std@0.108.0/testing/asserts.ts";
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { getDTSFilesForRun, graphql, prisma } from "./testRunner.ts";

Deno.test("It allows you to add a generic parameter", async () => {
  const prismaSchema = prisma`
model Game {
    id            Int          @id @default(autoincrement())
    homeTeamID    Int
    awayTeamID    Int
}
`;

  const sdl = graphql`
type Game {
    id: Int!
    homeTeamId: Int!
    awayTeamId: Int!
}
`;

  const services = `
import { db } from "src/lib/db";

export const Game: GameResolvers<{ type: string }> = {};
`;

  const { vfs } = await getDTSFilesForRun({ sdl, services, prismaSchema });

  assertStringIncludes(vfs.get("/types/games.d.ts")!, "interface GameTypeResolvers<Extended>");
  assertStringIncludes(vfs.get("/types/games.d.ts")!, "GameAsParent<Extended> = PGame & {} & Extended");

  assertEquals(
    vfs.get("/types/games.d.ts"),
    `
import type { GraphQLResolveInfo } from "graphql";
import type { RedwoodGraphQLContext } from "@redwoodjs/graphql-server/dist/functions/types";

type GameAsParent<Extended> = PGame & {} & Extended;

export interface GameTypeResolvers<Extended> {
}
`.trimStart(),
  );
});
