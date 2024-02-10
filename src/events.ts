import { Shot } from "./engine/board.ts";

export const CONNECTION__JOIN_EVENT = "connection__join";
export const CONNECTION__READY_EVENT = "connection__ready";
export type ConnectionJoinEvent = {
  isNeedToMakeShot: boolean;
};

export const CONNECTION__MAKE_SHOT_EVENT = "connection__make_shot";
export const CONNECTION__TAKE_SHOT_EVENT = "connection__take_shot";
export type ConnectionShotEvent = {
  x: number;
  y: number;
};

export const CONNECTION__MAKE_SHOT_RESULT_EVENT =
  "connection__make_shot_result";
export const CONNECTION__TAKE_SHOT_RESULT_EVENT =
  "connection__take_shot_result";
export type ConnectionShotResultEvent = {
  shot: Shot;
};

export const CONNECTION__DISCONNECT_EVENT = "connection__disconnect";

export const GAME__START_EVENT = "game__start";
export type GameStartEvent = {
  isNeedToMakeShot: boolean;
};

export const GAME__OVER_EVENT = "game__over";
export type GameOverEvent = {
  win: boolean;
};

export const GAME__MAKE_SHOT_EVENT = "game__make_shot";
export type GameMakeShotEvent = {
  x: number;
  y: number;
};
