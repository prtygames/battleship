import { Game } from "phaser";
import { LoadingScene } from "./scenes/LoadingScene.ts";

export class Controller {
  constructor(private game: Game) {}

  startGame() {
    this.game.scene.start(LoadingScene.key);

    // this.hideScenes();
    // this.loadingScene.
    // this.game.scene.start(LoadingScene.key);
    // inviteOpponentScene.scene.setVisible(false);
    // inviteOpponentScene.scene.start(PlayScene.key);
  }

  hideScenes() {
    // this.game.scene.start(false);
    // this.inviteOpponentScene.scene.setVisible(false);
    // this.joinGameScene.scene.setVisible(false);
    // this.playScene.scene.setVisible(false);
    // this.gameOverScene.scene.setVisible(false);
  }
}
