import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;

export class GameOverScene extends Phaser.Scene {
  static readonly key: string = "game-over";

  private title!: Text;

  private titleValue: string = "";

  constructor() {
    super(GameOverScene.key);
  }

  preload() {}

  init(data: { win?: boolean }) {
    const isWinner = data?.win ?? false;

    this.titleValue = isWinner ? "You WIN!" : "You lose :(";
  }

  create() {
    this.title = this.add.text(0, 0, this.titleValue, {
      color: "#415fcc",
      fontSize: Math.min(
        Math.min(this.scale.width, this.scale.height) / 5,
        150,
      ),
      fontFamily: "Hiddencocktails",
      align: "center",
    });

    this.title.setPosition(this.scale.width / 2, this.scale.height / 2.3);
    this.title.setOrigin(0.5, 0.5);
  }
}
