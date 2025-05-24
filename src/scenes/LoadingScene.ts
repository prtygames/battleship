import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;

export class LoadingScene extends Phaser.Scene {
  static readonly key: string = "loading";

  private text!: Text;

  constructor() {
    super(LoadingScene.key);
  }

  preload() {
    this.load.font("Hiddencocktails", "fonts/Hiddencocktails.woff");
  }

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
        const fontSize = Math.min(
          Math.min(this.scale.width, this.scale.height) / 5,
          100 * window.devicePixelRatio,
        );

        this.text
          .setFontSize(fontSize)
          .setOrigin(0.5, 0)
          .setPosition(this.scale.width / 2, this.scale.height / 2 - fontSize);
      }
    }
  }
}
