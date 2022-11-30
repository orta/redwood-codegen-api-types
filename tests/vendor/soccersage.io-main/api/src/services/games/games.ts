import type {
    QueryResolvers,
    MutationResolvers,
    GameResolvers,
} from 'types/graphql';

import { db } from 'src/lib/db';

export const games: QueryResolvers['games'] = () => {
    return db.game.findMany({
        orderBy: {
            startDateTime: 'asc',
        },
    });
};

export const upcomingGames: QueryResolvers['upcomingGames'] = () => {
    return db.game.findMany({
        where: { isCompleted: false, startDateTime: { gt: new Date() } },
    });
};

export const game: QueryResolvers['game'] = ({ id }) => {
    return db.game.findUnique({
        where: { id },
    });
};

export const createGame: MutationResolvers['createGame'] = ({ input }) => {
    return db.game.create({
        data: input,
    });
};

export const updateGame: MutationResolvers['updateGame'] = ({ id, input }) => {
    return db.game.update({
        data: input,
        where: { id },
    });
};

export const deleteGame: MutationResolvers['deleteGame'] = async ({ id }) => {
    await db.prediction.deleteMany({
        where: { gameId: id },
    });

    return db.game.delete({
        where: { id },
    });
};

export const Game: GameResolvers = {
    id: (_obj, { root }) => root.id,
    seasonId: (_obj, { root }) => root.seasonId,
    awayTeamId: (_obj, { root }) => root.awayTeamId,
    homeTeamId: (_obj, { root }) => root.homeTeamId,
    awayTeamScore: (_obj, { root }) => root.awayTeamScore,
    homeTeamScore: (_obj, { root }) => root.homeTeamScore,
    isCompleted: (_obj, { root }) => root.isCompleted,
    startDateTime: (_obj, { root }) => root.startDateTime,
    predictions: (_obj, { root }) =>
        db.game.findUnique({ where: { id: root.id } }).predictions(),
    homeTeam: (_obj, { root }) =>
        db.game.findUnique({ where: { id: root.id } }).homeTeam(),
    awayTeam: (_obj, { root }) =>
        db.game.findUnique({ where: { id: root.id } }).awayTeam(),
    season: (_obj, { root }) =>
        db.game.findUnique({ where: { id: root.id } }).season(),
};
