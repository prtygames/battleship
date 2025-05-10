import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;

export class LoadingScene extends Phaser.Scene {
  static readonly key: string = "loading";

  private text!: Text;

  constructor() {
    super(LoadingScene.key);
  }

  preload() {}

  create() {
    this.text = this.add.text(0, 0, "Loading...", {
      color: "#415fcc",
      fontFamily: "Hiddencocktails",
      align: "center",
    });

    this.scale.on("resize", () => this.resize());

    this.resize();
  }

  private resize() {
    if (this.scene.isVisible(LoadingScene.key)) {
      if (this.text) {
        this.text
          .setFontSize(
            Math.min(
              Math.min(this.scale.width, this.scale.height) /
                5 /
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
