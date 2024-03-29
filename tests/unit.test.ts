import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { getDTSFilesForRun, graphql, prisma } from "./testRunner.ts";

Deno.test("general test of flow", async () => {
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

type Query {
    games: [Game!]!
}

type Mutation {
    createGame: Game!
}
`;

  const services = `
import { db } from "src/lib/db";

export const Game = {};
`;

  const { vfs } = await getDTSFilesForRun({ sdl, services, prismaSchema });

  assertEquals(
    vfs.get("/types/games.d.ts"),
    `
import type { Game as PGame } from "@prisma/client";\n
type GameAsParent = PGame & {};

export interface GameTypeResolvers {
}
`.trimStart(),
  );
});
