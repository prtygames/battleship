import Phaser from "phaser";
import { InviteOpponentScene } from "./scenes/InviteOpponentScene.ts";
import { LoadingScene } from "./scenes/LoadingScene.ts";
import { PlayScene } from "./scenes/PlayScene.ts";
import { GameEngine, GameEngineInterface } from "./engine/game.ts";
import { GameOverScene } from "./scenes/GameOverScene.ts";
import {
  CONNECTION__JOIN_EVENT,
  CONNECTION__MAKE_SHOT_EVENT,
  CONNECTION__MAKE_SHOT_RESULT_EVENT,
  CONNECTION__READY_EVENT,
  CONNECTION__TAKE_SHOT_EVENT,
  CONNECTION__TAKE_SHOT_RESULT_EVENT,
  CONNECTION__DISCONNECT_EVENT,
  ConnectionShotEvent,
  ConnectionShotResultEvent,
  GAME__MAKE_SHOT_EVENT,
  GAME__OVER_EVENT,
  GAME__START_EVENT,
  GameMakeShotEvent,
  GameOverEvent,
  ConnectionJoinEvent,
  GAME__SHIP_PLACEMENT_EVENT,
  GameShipPlacementEvent,
  GAME__READY_EVENT,
} from "./events.ts";
import { Connection } from "./connection.ts";
import { OpponentLeftScene } from "./scenes/OpponentLeftScene.ts";
import debounce from "debounce";
import { ShipPlacementScene } from "./scenes/ShipPlacementScene.ts";

const boardSize = 8;
const shipTypes = [
  // { decks: 4, count: 1 },
  // { decks: 3, count: 2 },
  // { decks: 2, count: 3 },
  // { decks: 1, count: 4 },
  { decks: 3, count: 1 },
  { decks: 2, count: 3 },
  { decks: 1, count: 4 },
];

const gameEngine: GameEngineInterface = new GameEngine(boardSize, shipTypes);

const loadingScene = new LoadingScene();
const inviteOpponentScene = new InviteOpponentScene();
const opponentLeftScene = new OpponentLeftScene();
const shipPlacementScene = new ShipPlacementScene(
  boardSize,
  (scene: ShipPlacementScene) => {
    gameEngine.replaceHeroShips();
    scene.setBoard(gameEngine.getHeroBoard());
  },
  () => {
    game.events.emit(GAME__READY_EVENT, {});
  },
);
const playScene = new PlayScene(boardSize);
const gameOverScene = new GameOverScene();

const url = new URL(window.location.href);
const hostId = url.searchParams.get("id") ?? url.searchParams.get("ID") ?? "";
const isHost = !hostId;

const joinUrl = new URL(url.toString());

const game = new Phaser.Game({
  scale: {
    mode: Phaser.Scale.NONE,
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    zoom: 1 / window.devicePixelRatio,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "game",
  },
  scene: [
    loadingScene,
    inviteOpponentScene,
    shipPlacementScene,
    playScene,
    gameOverScene,
    opponentLeftScene,
  ],
  backgroundColor: "#fff",
});

window.addEventListener(
  "resize",
  debounce(() => resize(), 50),
);

function resize() {
  const w = window.innerWidth * window.devicePixelRatio;
  const h = window.innerHeight * window.devicePixelRatio;

  game.scale.resize(w, h);
  for (const scene of game.scene.scenes) {
    if (scene.scene.settings.active) {
      scene.cameras.main.setViewport(0, 0, w, h);
    }
  }
}

let wins = 0;
let losses = 0;

function runScene(key: string, data?: object) {
  for (const activeScene of game.scene.getScenes()) {
    game.scene.stop(activeScene);
  }

  game.scene.start(key, data);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

let connection: Connection | undefined;

async function start() {
  wins = 0;
  losses = 0;

  if (isHost) {
    [connection] = await Promise.all([
      Connection.createHostConnection(game.events),
      wait(1000),
    ]);

    joinUrl.searchParams.set("id", connection.getId());

    runScene(InviteOpponentScene.key, {
      joinUrl: joinUrl.toString(),
    });

    game.events.on(CONNECTION__JOIN_EVENT, (event: ConnectionJoinEvent) => {
      const gameShipPlacementEvent: GameShipPlacementEvent = {
        isNeedToMakeShot: event.isNeedToMakeShot,
      };
      game.events.emit(GAME__SHIP_PLACEMENT_EVENT, gameShipPlacementEvent);

      game.events.emit(CONNECTION__READY_EVENT, {
        isNeedToMakeShot: !event.isNeedToMakeShot,
      });
    });
  } else {
    connection = await Connection.join(game.events, hostId);

    game.events.on(CONNECTION__READY_EVENT, (event: ConnectionJoinEvent) => {
      const gameShipPlacementEvent: GameShipPlacementEvent = {
        isNeedToMakeShot: event.isNeedToMakeShot,
      };
      game.events.emit(GAME__SHIP_PLACEMENT_EVENT, gameShipPlacementEvent);
    });

    game.events.emit(CONNECTION__JOIN_EVENT);
  }

  game.events.on(CONNECTION__DISCONNECT_EVENT, async () => {
    if (playScene.scene.isActive() || shipPlacementScene.scene.isActive()) {
      runScene(OpponentLeftScene.key);
    }

    await wait(3000);

    url.searchParams.delete("id");

    window.location.href = url.toString();
  });

  game.events.on(
    GAME__SHIP_PLACEMENT_EVENT,
    (event: GameShipPlacementEvent) => {
      gameEngine.initGame(event.isNeedToMakeShot ? "hero" : "enemy");
      runScene(ShipPlacementScene.key);

      shipPlacementScene.setBoard(gameEngine.getHeroBoard());
    },
  );

  game.events.on(GAME__READY_EVENT, () => {
    runScene(PlayScene.key);

    playScene.initGame(gameEngine.getHeroBoard());

    playScene.updateGameState(
      "waiting",
      gameEngine.getHeroBoard(),
      gameEngine.getEnemyBoard(),
    );
  });

  game.events.on(GAME__START_EVENT, () => {
    gameEngine.startGame();

    playScene.updateGameState(
      gameEngine.getState(),
      gameEngine.getHeroBoard(),
      gameEngine.getEnemyBoard(),
    );
  });

  game.events.on(GAME__MAKE_SHOT_EVENT, (event: GameMakeShotEvent) => {
    if (gameEngine.getEnemyBoard()[event.x][event.y].state !== "empty") {
      return;
    }

    playScene.updateGameState(
      "waiting",
      gameEngine.getHeroBoard(),
      gameEngine.getEnemyBoard(),
    );

    game.events.emit(CONNECTION__MAKE_SHOT_EVENT, { x: event.x, y: event.y });
  });

  game.events.on(
    CONNECTION__MAKE_SHOT_RESULT_EVENT,
    (event: ConnectionShotResultEvent) => {
      gameEngine.applyHeroShotResult(event.shot);

      if (["sank", "hit", "game-over"].includes(event.shot.result)) {
        playScene.playSound("hit");
      } else {
        playScene.playSound("miss");
      }

      if (event.shot.result === "game-over") {
        wins += 1;

        const event: GameOverEvent = { win: true };
        game.events.emit(GAME__OVER_EVENT, event);
      }

      playScene.updateGameState(
        gameEngine.getState(),
        gameEngine.getHeroBoard(),
        gameEngine.getEnemyBoard(),
      );
    },
  );

  game.events.on(CONNECTION__TAKE_SHOT_EVENT, (event: ConnectionShotEvent) => {
    const shot = gameEngine.makeEnemyShot({ x: event.x, y: event.y });
    if (shot) {
      game.events.emit(CONNECTION__TAKE_SHOT_RESULT_EVENT, { shot: shot });

      if (["sank", "hit", "game-over"].includes(shot.result)) {
        playScene.playSound("hit");
      } else {
        playScene.playSound("miss");
      }

      if (shot.result === "game-over") {
        losses += 1;
        const event: GameOverEvent = { win: false };
        game.events.emit(GAME__OVER_EVENT, event);
      }

      playScene.updateGameState(
        gameEngine.getState(),
        gameEngine.getHeroBoard(),
        gameEngine.getEnemyBoard(),
      );
    }
  });

  game.events.on(GAME__OVER_EVENT, async (event: GameOverEvent) => {
    await wait(500);

    runScene(GameOverScene.key, { win: event.win, wins, losses });
    await wait(3000);

    if (!isHost) {
      game.events.emit(CONNECTION__JOIN_EVENT);
    }
  });
}

start();
