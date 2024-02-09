export const JOIN_GAME_EVENT = "join_game";

export type JoinGameEvent = {
  name: string;
};

export const MAKE_SHOT_EVENT = "make_shot";

export type MakeShotEvent = {
  x: number;
  y: number;
};

export const START_GAME_EVENT = "start_game";

export type StartGameEvent = {
  isNeedToMakeShot: boolean;
};
