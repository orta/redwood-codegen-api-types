import { createGame, deleteGame, game, games, updateGame } from './games';
import type { StandardScenario } from './games.scenarios';

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('games', () => {
    scenario('returns all games', async (scenario: StandardScenario) => {
        const result = await games();

        expect(result.length).toEqual(Object.keys(scenario.game).length);
    });

    scenario('returns a single game', async (scenario: StandardScenario) => {
        const result = await game({ id: scenario.game.one.id });
        expect(result).toEqual(scenario.game.one);
    });

    scenario('creates a game', async (scenario: StandardScenario) => {
        const result = await createGame({
            input: {
                homeTeamId: scenario.game.two.homeTeamId,
                awayTeamId: scenario.game.two.awayTeamId,
                startDateTime: new Date(),
                seasonId: scenario.game.two.seasonId,
            },
        });

        expect(result.homeTeamId).toEqual(scenario.game.two.homeTeamId);
        expect(result.awayTeamId).toEqual(scenario.game.two.awayTeamId);
    });

    scenario('updates a game', async (scenario: StandardScenario) => {
        const original = await game({ id: scenario.game.one.id });
        const result = await updateGame({
            id: original.id,
            input: { homeTeamId: scenario.game.two.homeTeamId },
        });

        expect(result.homeTeamId).toEqual(scenario.game.two.homeTeamId);
    });

    scenario('deletes a game', async (scenario: StandardScenario) => {
        const original = await deleteGame({ id: scenario.game.one.id });
        const result = await game({ id: original.id });

        expect(result).toEqual(null);
    });
});
