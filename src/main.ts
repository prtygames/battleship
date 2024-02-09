import Phaser from "phaser";
import { InviteOpponentScene } from "./scenes/InviteOpponentScene.ts";
import { LoadingScene } from "./scenes/LoadingScene.ts";
import { JoinGameScene } from "./scenes/JoinGameScene.ts";
import { PlayScene } from "./scenes/PlayScene.ts";
import { GameEngine, GameEngineInterface } from "./engine/game.ts";
import { GameOverScene } from "./scenes/GameOverScene.ts";
import {
  MAKE_SHOT_EVENT,
  MakeShotEvent,
  START_GAME_EVENT,
  StartGameEvent,
} from "./events.ts";
import { Shot } from "./engine/board.ts";

const isHost: boolean = true;
const gameEngine: GameEngineInterface = new GameEngine();
const gameEngine2: GameEngineInterface = new GameEngine();

const loadingScene = new LoadingScene();
const inviteOpponentScene = new InviteOpponentScene();
const joinGameScene = new JoinGameScene();
const playScene = new PlayScene();
const gameOverScene = new GameOverScene();

const game = new Phaser.Game({
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "game",
  },
  scene: [
    loadingScene,
    inviteOpponentScene,
    joinGameScene,
    playScene,
    gameOverScene,
  ],
  backgroundColor: "#fff",
});

function runScene(key: string, data?: object) {
  for (const activeScene of game.scene.getScenes()) {
    game.scene.stop(activeScene);
  }
  game.scene.start(key, data);
}

if (isHost) {
  // setTimeout(() => {
  //   runScene(InviteOpponentScene.key);
  // }, 1000);

  setTimeout(() => {
    const event: StartGameEvent = {
      isNeedToMakeShot: true,
    };

    game.events.emit(START_GAME_EVENT, event);
    playScene.updateGameState(
      gameEngine.getState(),
      gameEngine.getHeroBoard(),
      gameEngine.getEnemyBoard(),
    );
  }, 1500);
}

game.events.on(START_GAME_EVENT, () => {
  runScene(PlayScene.key);

  gameEngine.startGame("hero");
  gameEngine2.startGame("enemy");

  playScene.initGame(gameEngine.getHeroBoard());
});

// setTimeout(() => {
//   playScene.updateGameState(
//     gameEngine.getState(),
//     gameEngine.getHeroBoard(),
//     gameEngine.getEnemyBoard(),
//   );
// }, 2000);

game.events.on(MAKE_SHOT_EVENT, (event: MakeShotEvent) => {
  if (gameEngine.getEnemyBoard()[event.x][event.y].state !== "empty") {
    return;
  }

  const shot = gameEngine2.makeEnemyShot({ x: event.x, y: event.y });
  if (shot) {
    gameEngine.applyHeroShotResult(shot);

    if (shot.result === "game-over") {
      setTimeout(() => {
        runScene(GameOverScene.key, { win: true });
      }, 300);

      return;
    }

    setTimeout(() => {
      let x: number;
      let y: number;
      let shot: Shot | null = null;
      do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
        if (gameEngine.getEnemyBoard()[x][y].state == "empty") {
          shot = gameEngine.makeEnemyShot({ x, y });
        }
      } while (shot === null);

      if (shot) {
        gameEngine2.applyHeroShotResult(shot);
        if (shot.result === "game-over") {
          setTimeout(() => {
            runScene(GameOverScene.key, { win: false });
          }, 300);

          return;
        }
      }

      playScene.updateGameState(
        gameEngine.getState(),
        gameEngine.getHeroBoard(),
        gameEngine.getEnemyBoard(),
      );
    }, 500);
  }

  playScene.updateGameState(
    gameEngine.getState(),
    gameEngine.getHeroBoard(),
    gameEngine.getEnemyBoard(),
  );
});
