// import type {
//     QueryResolvers,
//     MutationResolvers,
//     GameResolvers,
// } from 'types/graphql';

import type { MCreateGame, MDeleteGame, MUpdateGame, QGame, QGames, QUpcomingGames } from "../../../../../soccersage-output/games.d.ts";

import { db } from "src/lib/db";

export const games: QGames = (args, obj) => {
  return db.game.findMany({
    orderBy: {
      startDateTime: "asc",
    },
  });
};

export const upcomingGames: QUpcomingGames = () => {
  return db.game.findMany({
    where: { isCompleted: false, startDateTime: { gt: new Date() } },
  });
};

export const game: QGame = ({ id }) => {
  return db.game.findUnique({
    where: { id },
  });
};

export const createGame: MCreateGame = ({ input }) => {
  return db.game.create({
    data: input,
  });
};

export const updateGame: MUpdateGame = ({ id, input }) => {
  return db.game.update({
    data: input,
    where: { id },
  });
};

export const deleteGame: MDeleteGame = async ({ id }) => {
  await db.prediction.deleteMany({
    where: { gameId: id },
  });

  return db.game.delete({
    where: { id },
  });
};

export const Game: GameResolvers = {
  predictions: (_obj, { root }) => db.game.findUnique({ where: { id: root.id } }).predictions(),
  homeTeam: (_obj, { root }) => db.game.findUnique({ where: { id: root.id } }).homeTeam(),
  awayTeam: (_obj, { root }) => db.game.findUnique({ where: { id: root.id } }).awayTeam(),
  season: (_obj, { root }) => db.game.findUnique({ where: { id: root.id } }).season(),
};
