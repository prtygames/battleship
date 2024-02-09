import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;
import debounce from "debounce";
import GAMEOBJECT_POINTER_DOWN = Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN;
import { JOIN_GAME_EVENT, JoinGameEvent } from "../events.ts";

export class JoinGameScene extends Phaser.Scene {
  static readonly key: string = "join_game";

  private title!: Text;
  private loading: boolean = false;
  private fontSize: number = 0;

  constructor() {
    super(JoinGameScene.key);
  }

  preload() {}

  create() {
    this.title = this.add.text(0, 0, "Join game", {
      align: "center",
      color: "#415fcc",
      fontFamily: "Hiddencocktails",
    });

    this.title.setInteractive({ useHandCursor: true });
    this.title.on(GAMEOBJECT_POINTER_DOWN, () => {
      this.title.setFill("#4c70f5");
      this.title.setFontSize(this.fontSize * 0.98);

      this.loading = true;
      this.title.setInteractive(!this.loading);

      this.joinGame();
    });

    this.scale.on(
      "resize",
      debounce(() => this.resize(), 200),
    );

    this.resize();
  }

  private joinGame(): void {
    const eventData: JoinGameEvent = { name: "Player2" };
    this.game.events.emit(JOIN_GAME_EVENT, eventData);
  }

  private resize(): void {
    if (this.scene.isVisible(JoinGameScene.key)) {
      this.fontSize = Math.min(
        Math.min(this.scale.width, this.scale.height) / 5,
        150,
      );
      this.title.setFontSize(this.fontSize);
      this.title.setPosition(this.scale.width / 2, this.scale.height / 2.3);
      this.title.setOrigin(0.5, 0.5);
    }
  }
}
