import Phaser from "phaser";
import { GameCell } from "./objects/GameCell.ts";
import { GameState } from "../engine/game.ts";
import debounce from "debounce";
import { Cell } from "../engine/board.ts";
import { GAME__MAKE_SHOT_EVENT, GameMakeShotEvent } from "../events.ts";
import Text = Phaser.GameObjects.Text;
import TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export class PlayScene extends Phaser.Scene {
  static readonly key: string = "play";

  private minMargin: number = 25;
  private marginX: number = 0;
  private marginY: number = 0;
  private maxCellSize: number = 100;
  private cellSize: number = 0;

  private playerBoard: GameCell[][] = [];
  private enemyBoard: GameCell[][] = [];

  private turnLabel!: Text;

  private state: GameState = "waiting";

  private clickSound?: Phaser.Sound.BaseSound;

  constructor(private boardSize: number) {
    super(PlayScene.key);
  }

  create() {
    this.playerBoard = [];
    this.enemyBoard = [];

    const labelStyle: TextStyle = {
      align: "center",
      color: "#3a59cb",
      fontFamily: "Hiddencocktails",
    };

    this.turnLabel = this.add.text(0, 0, "", labelStyle);

    this.scale.on(
      "resize",
      debounce(() => {
        this.calculateSize();
        this.updateBoards();
      }, 200),
    );

    this.load.audio("click", ["sounds/click.mp3", "sounds/click.ogg"]);
    this.load.once("complete", () => {
      this.clickSound = this.sound.add("click", { volume: 0.5 });
    });
    this.load.start();
  }

  initGame(playerBoard: Readonly<Cell[][]>) {
    for (let i = 0; i < this.boardSize; i++) {
      const playerRow: GameCell[] = [];
      const enemyRow: GameCell[] = [];
      for (let j = 0; j < this.boardSize; j++) {
        const playerCell = new GameCell(this);
        playerCell.setState(playerBoard[i][j].state);
        playerCell.setActive(false);
        playerRow.push(playerCell);

        const enemyCell = new GameCell(this, () => this.heroShot(i, j));
        enemyCell.setState("empty");
        enemyCell.setActive(false);
        enemyRow.push(enemyCell);
      }
      this.playerBoard.push(playerRow);
      this.enemyBoard.push(enemyRow);
    }

    this.calculateSize();
    this.updateBoards();
  }

  updateGameState(
    state: GameState,
    playerBoard: Readonly<Cell[][]>,
    enemyBoard: Readonly<Cell[][]>,
  ): void {
    this.state = state;

    const isHeroBoardActive = this.state === "enemy";
    const isEnemyBoardActive = this.state === "hero";

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        this.playerBoard[i][j].setState(playerBoard[i][j].state);
        this.enemyBoard[i][j].setState(enemyBoard[i][j].state);
      }
    }

    this.turnLabel.setText(isHeroBoardActive ? "Wait opponent" : "Your turn");

    this.playerBoard.forEach((row) =>
      row.forEach((item) => item.setActive(isHeroBoardActive)),
    );

    this.enemyBoard.forEach((row) =>
      row.forEach((item) => item.setActive(isEnemyBoardActive)),
    );
  }

  private updateBoards(): void {
    const turnLabelMargin = this.scale.isGamePortrait ? 0 : this.cellSize;

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const gameCell = this.playerBoard[i][j];
        gameCell.updatePosition(
          {
            x: this.marginX + i * this.cellSize,
            y: this.marginY + j * this.cellSize + turnLabelMargin,
          },
          this.cellSize,
        );
      }
    }

    let marginX: number = this.marginX;
    let marginY: number = this.marginY + turnLabelMargin;
    if (this.scale.isGamePortrait) {
      marginY =
        this.marginY + this.minMargin + (this.boardSize + 1) * this.cellSize;
    } else {
      marginX =
        this.marginX +
        this.minMargin +
        (this.boardSize + 1 - 1) * this.cellSize;
    }

    this.turnLabel.setPosition(
      this.marginX,
      marginY - (this.minMargin / 1.5 + this.cellSize),
    );
    this.turnLabel.setFixedSize(
      this.scale.isGamePortrait
        ? this.cellSize * this.boardSize
        : this.cellSize * this.boardSize * 2,
      this.minMargin + this.cellSize,
    );
    this.turnLabel.setFontSize(this.cellSize);

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const gameCell = this.enemyBoard[i][j];
        gameCell.updatePosition(
          {
            x: marginX + (i + 1 - 1) * this.cellSize,
            y: marginY + (j + 1 - 1) * this.cellSize,
          },
          this.cellSize,
        );
      }
    }
  }

  private calculateSize(): void {
    let x: number = 0;
    let y: number = 0;

    if (this.scale.isGamePortrait) {
      x = (this.scale.width - 2 * this.minMargin) / this.boardSize;
      y = (this.scale.height - 3 * this.minMargin) / (this.boardSize * 2 + 1);
    } else {
      x = (this.scale.width - 3 * this.minMargin) / (this.boardSize * 2);
      y = (this.scale.height - 3 * this.minMargin) / (this.boardSize + 1);
    }

    this.cellSize = Math.min(x, y, this.maxCellSize);

    if (this.scale.isGamePortrait) {
      this.marginX = (this.scale.width - this.boardSize * this.cellSize) / 2;
      this.marginY =
        (this.scale.height -
          (this.boardSize * 2 + 1) * this.cellSize -
          this.minMargin) /
        2;
    } else {
      this.marginX =
        (this.scale.width -
          this.boardSize * 2 * this.cellSize -
          this.minMargin) /
        2;
      this.marginY =
        (this.scale.height - (this.boardSize + 1) * this.cellSize) / 2;
    }
  }

  private heroShot(x: number, y: number): void {
    if (this.state === "hero") {
      if (this.clickSound) {
        this.clickSound.play();
      }

      const event: GameMakeShotEvent = { x, y };
      this.game.events.emit(GAME__MAKE_SHOT_EVENT, event);
    }
  }
}
