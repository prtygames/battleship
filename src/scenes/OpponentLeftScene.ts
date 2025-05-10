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
      fontFamily: "Hiddencocktails",
      align: "center",
    });

    this.scale.on("resize", () => this.resize());

    this.resize();
  }

  private resize() {
    if (this.scene.isVisible(OpponentLeftScene.key)) {
      if (this.title) {
        this.title
          .setFontSize(
            Math.min(
              Math.min(this.scale.width, this.scale.height) /
                7.5 /
                window.devicePixelRatio,
              150,
            ),
          )
          .setOrigin(0.5, 0.5)
          .setPosition(this.scale.width / 2, this.scale.height / 2.3)
          .setScale(window.devicePixelRatio);
      }
    }
  }
}
