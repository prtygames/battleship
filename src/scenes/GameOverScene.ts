import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;

export class GameOverScene extends Phaser.Scene {
  static readonly key: string = "game-over";

  private title!: Text;
  private score!: Text;

  private titleValue: string = "";
  private scoreValue: string = "";
  private loss: boolean = false;

  constructor() {
    super(GameOverScene.key);
  }

  preload() {}

  init(data: { win: boolean; wins: number; losses: number }) {
    const isWinner = data?.win ?? false;

    this.titleValue = isWinner ? "You WIN! 😎" : "You lose 🙁";
    this.scoreValue = `${data.wins}-${data.losses}`;

    this.loss = data.losses > data.wins;
  }

  create() {
    this.title = this.add.text(0, 0, this.titleValue, {
      color: "#415fcc",
      fontSize: Math.min(
        Math.min(this.scale.width, this.scale.height) / 6,
        150,
      ),
      fontFamily: "Hiddencocktails",
      align: "center",
    });

    this.title.setPosition(this.scale.width / 2, this.scale.height / 3);
    this.title.setOrigin(0.5, 0.5);

    this.score = this.add.text(0, 0, this.scoreValue, {
      color: this.loss ? "#f68282" : "#415fcc",
      fontSize: Math.min(
        Math.min(this.scale.width, this.scale.height) / 2,
        160,
      ),
      fontFamily: "Hiddencocktails",
      align: "center",
    });

    this.score.setPosition(this.scale.width / 2, this.scale.height / 2);
    this.score.setOrigin(0.5, 0.5);
  }
}
