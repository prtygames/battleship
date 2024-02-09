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
      fontSize: Math.min(
        Math.min(this.scale.width, this.scale.height) / 5,
        150,
      ),
      fontFamily: "Hiddencocktails",
      align: "center",
    });

    this.text.setPosition(this.scale.width / 2, this.scale.height / 2.3);
    this.text.setOrigin(0.5, 0.5);
  }
}
