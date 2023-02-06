import { assertSnapshot } from "https://deno.land/std@0.168.0/testing/snapshot.ts";
import { getDTSFilesForRun, graphql, prisma } from "./testRunner.ts";

Deno.test("uses a rn to promise when we see an async tag", async (t) => {
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
    homeTeamID: Int!
    awayTeamID: Int!

    summarySync: String!
    summaryAsync: String!
    summary: String!

}

type Query {
    gameObj: Game
    gameSync: Game
    gameAsync: Game
    gameAsync1Arg: Game
    gameAsync2Arg: Game
}
`;

  const services = `
import { db } from "src/lib/db";

export const gameSync = () => {}
export const gameAsync = async () => {}
export const gameAsync1Arg = (arg) => {}
export const gameAsync2Arg = (arg, obj) => {}
export const gameObj = {}

export const Game = {
  summary: "",
  summarySync: () => "",
  summaryAsync: async () => ""
};
`;

  const { vfs } = await getDTSFilesForRun({ sdl, services, prismaSchema });
  const dts = vfs.get("/types/games.d.ts")!;
  await assertSnapshot(t, dts);
});
