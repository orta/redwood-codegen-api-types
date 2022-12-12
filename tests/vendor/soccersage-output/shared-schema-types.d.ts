export interface CreateGameInput {
    awayTeamId: number;
    awayTeamScore?: number | undefined;
    homeTeamId: number;
    homeTeamScore?: number | undefined;
    isCompleted?: boolean | undefined;
    seasonId: number;
    startDateTime: DateTime;
}

export interface CreatePredictionInput {
    gameId: number;
    prediction: string;
    seasonId: number;
    teamId?: number | undefined;
    userId: number;
}

export interface CreateSeasonInput {
    endDate: DateTime;
    name: string;
    startDate: DateTime;
}

export interface CreateTeamInput {
    logoUrl?: string | undefined;
    name: string;
}

export interface CreateUserInput {
    email: string;
    hashedPassword: string;
    resetToken?: string | undefined;
    resetTokenExpiresAt?: DateTime | undefined;
    roles: string;
    salt: string;
    username: string;
}

export interface Game {
    awayTeam?: Team;
    awayTeamId: number;
    awayTeamScore?: number | undefined;
    homeTeam?: Team;
    homeTeamId: number;
    homeTeamScore?: number | undefined;
    id: number;
    isCompleted: boolean;
    predictions?: Array<Prediction>;
    season?: Season;
    seasonId: number;
    startDateTime: DateTime;
}

export interface Mutation {
    createGame: Game;
    createPrediction: Prediction;
    createSeason: Season;
    createTeam: Team;
    createUser: User;
    deleteGame: Game;
    deletePrediction: Prediction;
    deleteSeason: Season;
    deleteTeam: Team;
    deleteUser: User;
    resetPassword: User;
    sendResetPasswordEmail?: SuccessInput | undefined;
    updateGame: Game;
    updatePrediction: Prediction;
    updateSeason: Season;
    updateTeam: Team;
    updateUser: User;
}

export interface Prediction {
    game?: Game;
    gameId?: number;
    id?: number;
    prediction?: string;
    team?: Team | undefined;
    teamId?: number | undefined;
    user?: User | undefined;
    userId?: number;
}

export interface Query {
    game?: Game | undefined;
    games: Game[];
    myPredictions: Prediction[];
    prediction?: Prediction | undefined;
    predictions: Prediction[];
    redwood?: Redwood | undefined;
    season?: Season | undefined;
    seasons: Season[];
    standings?: StandingsResult | undefined;
    team?: Team | undefined;
    teams: Team[];
    upcomingGames: Game[];
    user?: User | undefined;
    users: User[];
}

export interface Redwood {
    currentUser?: JSON | undefined;
    prismaVersion?: string | undefined;
    version?: string | undefined;
}

export interface Season {
    Prediction?: Array<Prediction>;
    endDate?: DateTime;
    id?: number;
    name?: string;
    startDate?: DateTime;
}

export interface StandingsData {
    email: string;
    score: number;
    userId: string;
    username: string;
}

export interface StandingsResult {
    userIdRankings: StandingsData[];
}

export interface SuccessInput {
    message?: string | undefined;
    success?: boolean | undefined;
}

export interface Team {
    Prediction?: Array<Prediction>;
    awayTeamGames?: Array<Game>;
    homeTeamGames?: Array<Game>;
    id?: number;
    logoUrl?: string | undefined;
    name?: string;
}

export interface UpdateGameInput {
    awayTeamId?: number | undefined;
    awayTeamScore?: number | undefined;
    homeTeamId?: number | undefined;
    homeTeamScore?: number | undefined;
    isCompleted?: boolean | undefined;
    seasonId?: number | undefined;
    startDateTime?: DateTime | undefined;
}

export interface UpdatePredictionInput {
    gameId?: number | undefined;
    prediction?: string | undefined;
    teamId?: number | undefined;
    userId?: number | undefined;
}

export interface UpdateSeasonInput {
    endDate?: DateTime | undefined;
    name?: string | undefined;
    startDate?: DateTime | undefined;
}

export interface UpdateTeamInput {
    logoUrl?: string | undefined;
    name?: string | undefined;
}

export interface UpdateUserInput {
    email?: string | undefined;
    hashedPassword?: string | undefined;
    resetToken?: string | undefined;
    resetTokenExpiresAt?: DateTime | undefined;
    roles?: string | undefined;
    salt?: string | undefined;
    username?: string | undefined;
}

export interface User {
    email?: string;
    hashedPassword?: string;
    id?: number;
    predictions?: Array<Prediction>;
    resetToken?: string | undefined;
    resetTokenExpiresAt?: DateTime | undefined;
    roles?: string;
    salt?: string;
    username?: string;
}

type DateTime = any;
type JSON = any;
