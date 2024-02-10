import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;

export class OpponentLeftScene extends Phaser.Scene {
  static readonly key: string = "opponent-left";

  private title!: Text;

  constructor() {
    super(OpponentLeftScene.key);
  }

  preload() {}

  create() {
    this.title = this.add.text(0, 0, "Opponent left 🙁", {
      color: "#415fcc",
      fontSize: Math.min(
        Math.min(this.scale.width, this.scale.height) / 7,
        150,
      ),
      fontFamily: "Hiddencocktails",
      align: "center",
    });

    this.title.setPosition(this.scale.width / 2, this.scale.height / 2.3);
    this.title.setOrigin(0.5, 0.5);
  }
}
