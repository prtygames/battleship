import Phaser from "phaser";
import { GameCell } from "./objects/GameCell.ts";
import { GameState } from "../engine/game.ts";
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
  private hitSound?: Phaser.Sound.BaseSound;

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

    this.scale.on("resize", () => {
      this.calculateSize();
      this.updateBoards();
    });

    this.load.audio("click", ["sounds/click.mp3", "sounds/click.ogg"]);
    this.load.audio("hit", ["sounds/hit.mp3", "sounds/hit.ogg"]);
    this.load.once("complete", () => {
      this.clickSound = this.sound.add("click", { volume: 0.03 });
      this.hitSound = this.sound.add("hit", { volume: 0.03 });
    });
    this.load.start();

    this.sound.unlock();
  }

  initGame(playerBoard: Readonly<Cell[][]>) {
    for (let i = 0; i < this.boardSize; i++) {
      const playerRow: GameCell[] = [];
      const enemyRow: GameCell[] = [];
      for (let j = 0; j < this.boardSize; j++) {
        const playerCell = new GameCell(this);
        playerCell.setState(
          playerBoard[i][j].state,
          playerBoard?.[i]?.[j - 1]?.state ?? "empty",
          playerBoard?.[i]?.[j + 1]?.state ?? "empty",
          playerBoard?.[i - 1]?.[j]?.state ?? "empty",
          playerBoard?.[i + 1]?.[j]?.state ?? "empty",
        );
        playerCell.setActive(false);
        playerRow.push(playerCell);

        const enemyCell = new GameCell(this, () => this.heroShot(i, j));
        enemyCell.setState("empty", "empty", "empty", "empty", "empty");
        enemyCell.setActive(false);
        enemyRow.push(enemyCell);
      }
      this.playerBoard.push(playerRow);
      this.enemyBoard.push(enemyRow);
    }

    this.calculateSize();
    this.updateBoards();
  }

  playSound(sound: "hit" | "miss") {
    if (sound === "hit" && this.hitSound) {
      this.hitSound.play();
    } else if (sound === "miss" && this.clickSound) {
      this.clickSound.play();
    }
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
        this.playerBoard[i][j].setState(
          playerBoard[i][j].state,
          playerBoard?.[i]?.[j - 1]?.state ?? "empty",
          playerBoard?.[i]?.[j + 1]?.state ?? "empty",
          playerBoard?.[i - 1]?.[j]?.state ?? "empty",
          playerBoard?.[i + 1]?.[j]?.state ?? "empty",
        );
        this.enemyBoard[i][j].setState(
          enemyBoard[i][j].state,
          enemyBoard?.[i]?.[j - 1]?.state ?? "empty",
          enemyBoard?.[i]?.[j + 1]?.state ?? "empty",
          enemyBoard?.[i - 1]?.[j]?.state ?? "empty",
          enemyBoard?.[i + 1]?.[j]?.state ?? "empty",
        );
      }
    }

    this.turnLabel.setText(isEnemyBoardActive ? "Your turn" : "Wait opponent");

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
        this.marginY +
        this.minMargin * window.devicePixelRatio +
        (this.boardSize + 1) * this.cellSize;
    } else {
      marginX =
        this.marginX +
        this.minMargin * window.devicePixelRatio +
        (this.boardSize + 1 - 1) * this.cellSize;
    }

    this.turnLabel
      .setPosition(
        this.scale.width / 2,
        marginY - this.cellSize * 0.75, //- (this.minMargin / 1.5 + this.cellSize),
      )
      .setOrigin(0.5, 0.5);

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
      x =
        (this.scale.width - 2 * this.minMargin * window.devicePixelRatio) /
        this.boardSize;
      y =
        (this.scale.height - 3 * this.minMargin * window.devicePixelRatio) /
        (this.boardSize * 2 + 1);
    } else {
      x =
        (this.scale.width - 3 * this.minMargin * window.devicePixelRatio) /
        (this.boardSize * 2);
      y =
        (this.scale.height - 3 * this.minMargin * window.devicePixelRatio) /
        (this.boardSize + 1);
    }

    this.cellSize = Math.min(x, y, this.maxCellSize * window.devicePixelRatio);

    if (this.scale.isGamePortrait) {
      this.marginX = (this.scale.width - this.boardSize * this.cellSize) / 2;
      this.marginY =
        (this.scale.height -
          (this.boardSize * 2 + 1) * this.cellSize -
          this.minMargin * window.devicePixelRatio) /
        2;
    } else {
      this.marginX =
        (this.scale.width -
          this.boardSize * 2 * this.cellSize -
          this.minMargin * window.devicePixelRatio) /
        2;
      this.marginY =
        (this.scale.height - (this.boardSize + 1) * this.cellSize) / 2;
    }
  }

  private heroShot(x: number, y: number): void {
    if (this.state === "hero") {
      const event: GameMakeShotEvent = { x, y };
      this.game.events.emit(GAME__MAKE_SHOT_EVENT, event);
    }
  }
}
