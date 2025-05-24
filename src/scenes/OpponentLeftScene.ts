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
    this.title = this.add.text(0, 0, "Opponent left \n 🙁", {
      color: "#415fcc",
      fontFamily: "Hiddencocktails",
      align: "center",
    });

    this.scale.on("resize", () => this.resize());

    this.resize();
  }

  private resize() {
    if (this.scene.isVisible(OpponentLeftScene.key)) {
      if (this.title) {
        const fontSize = Math.min(
          Math.min(this.scale.width, this.scale.height) / 7,
          100 * window.devicePixelRatio,
        );

        this.title
          .setFontSize(fontSize)
          .setOrigin(0.5, 0.5)
          .setPosition(
            this.scale.width / 2,
            this.scale.height / 2 - fontSize / 2,
          );
      }
    }
  }
}
