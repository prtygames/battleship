import Phaser from "phaser";
import { GameCell } from "./objects/GameCell.ts";
import { Cell } from "../engine/board.ts";
import Text = Phaser.GameObjects.Text;
import GAMEOBJECT_POINTER_DOWN = Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN;
import Rectangle = Phaser.Geom.Rectangle;

export class ShipPlacementScene extends Phaser.Scene {
  static readonly key: string = "ship-placement";

  private minMargin: number = 25;
  private marginX: number = 0;
  private marginY: number = 0;
  private maxCellSize: number = 40;
  private cellSize: number = 0;

  private board: GameCell[][] = [];

  private title!: Text;
  private replacementTitle!: Text;
  private startGameTitle!: Text;

  private top: number = 0;

  constructor(
    private boardSize: number,
    private onReplaceShips: (scene: ShipPlacementScene) => void,
    private onStartGame: () => void,
  ) {
    super(ShipPlacementScene.key);
  }

  create() {
    this.board = [];

    this.title = this.add.text(0, 0, "Your ships", {
      align: "center",
      color: "#3a59cb",
      fontFamily: "Hiddencocktails",
    });

    this.replacementTitle = this.add.text(0, 0, "↻", {
      align: "center",
      color: "#3a59cb",
      fontFamily: "Hiddencocktails",
    });

    this.replacementTitle.on(GAMEOBJECT_POINTER_DOWN, () => {
      try {
        this.replacementTitle.setTint(0x3a59cb);
        this.onReplaceShips(this);
      } finally {
        this.replacementTitle.setTint(0xffffff);
      }
    });
    this.replacementTitle.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, 0, 0),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    this.startGameTitle = this.add.text(0, 0, "Start game", {
      align: "center",
      color: "#3a59cb",
      fontFamily: "Hiddencocktails",
    });
    this.startGameTitle.on(GAMEOBJECT_POINTER_DOWN, () => this.onStartGame());
    this.startGameTitle.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, 0, 0),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    this.scale.on("resize", () => this.resize());
  }

  resize() {
    if (this.scene.isVisible(ShipPlacementScene.key)) {
      const fontSize = Math.min(
        Math.min(this.scale.width, this.scale.height) / 5,
        100 * window.devicePixelRatio,
      );

      this.top = Math.min(fontSize);

      this.calculateSize();
      this.updateBoards();

      if (this.title) {
        this.title
          .setFontSize(fontSize)
          .setOrigin(0.5, 0.5)
          .setPosition(this.scale.width / 2, fontSize * 0.5);
      }

      if (this.replacementTitle) {
        const replacementTitleTop =
          this.marginY + this.top + this.boardSize * this.cellSize;

        this.replacementTitle
          .setFontSize(fontSize * 0.8)
          .setOrigin(0.5, 0.5)
          .setPosition(
            this.scale.width / 2,
            replacementTitleTop + fontSize * 0.4,
          );

        if (this.replacementTitle.input?.hitArea) {
          const area = this.replacementTitle.input?.hitArea as Rectangle;
          const bounds = this.replacementTitle.getBounds();
          area.setTo(0, 0, bounds.width, bounds.height);
        }
      }

      if (this.startGameTitle) {
        const startGameTitleTop =
          this.marginY + this.top + this.boardSize * this.cellSize;

        this.startGameTitle
          .setFontSize(fontSize * 0.8)
          .setOrigin(0.5, 0.5)
          .setPosition(
            this.scale.width / 2,
            startGameTitleTop + fontSize * 1.25,
          );

        if (this.startGameTitle.input?.hitArea) {
          const area = this.startGameTitle.input?.hitArea as Rectangle;
          const bounds = this.startGameTitle.getBounds();
          area.setTo(0, 0, bounds.width, bounds.height);
        }
      }
    }
  }

  setBoard(board: Readonly<Cell[][]>) {
    this.board = [];
    for (let i = 0; i < this.boardSize; i++) {
      const playerRow: GameCell[] = [];
      for (let j = 0; j < this.boardSize; j++) {
        const playerCell = new GameCell(this);
        playerCell.setState(
          board[i][j].state,
          board?.[i]?.[j - 1]?.state ?? "empty",
          board?.[i]?.[j + 1]?.state ?? "empty",
          board?.[i - 1]?.[j]?.state ?? "empty",
          board?.[i + 1]?.[j]?.state ?? "empty",
        );
        playerCell.setActive(true);
        playerRow.push(playerCell);
      }
      this.board.push(playerRow);
    }

    this.resize();
  }

  private updateBoards(): void {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const gameCell = this.board[i][j];
        gameCell.updatePosition(
          {
            x: this.marginX + i * this.cellSize,
            y: this.marginY + j * this.cellSize + this.top,
          },
          this.cellSize,
        );
      }
    }
  }

  private calculateSize(): void {
    // const x =
    //   (this.scale.width - 3 * this.minMargin * window.devicePixelRatio) /
    //   this.boardSize;
    const x =
      (this.scale.width - 2 * this.minMargin * window.devicePixelRatio) /
      this.boardSize;
    const y =
      (this.scale.height - 3 * this.minMargin * window.devicePixelRatio) /
      (this.boardSize * 2 + 1);
    this.cellSize = Math.min(x, y, this.maxCellSize * window.devicePixelRatio);

    this.marginX = (this.scale.width - this.boardSize * this.cellSize) / 2;
    this.marginY = this.cellSize;
  }
}
