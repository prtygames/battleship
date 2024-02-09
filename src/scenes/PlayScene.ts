import Phaser from "phaser";
import { GameCell } from "./objects/GameCell.ts";
import { LabelCell } from "./objects/LabelCell.ts";
import { GameState } from "../engine/game.ts";
import debounce from "debounce";
import { Cell } from "../engine/board.ts";
import { MAKE_SHOT_EVENT, MakeShotEvent } from "../events.ts";

export class PlayScene extends Phaser.Scene {
  static readonly key: string = "play";

  private minMargin: number = 20;
  private marginX: number = 0;
  private marginY: number = 0;
  private maxCellSize: number = 50;
  private cellSize: number = 0;

  private playerXLabels: LabelCell[] = [];
  private playerYLabels: LabelCell[] = [];
  private enemyXLabels: LabelCell[] = [];
  private enemyYLabels: LabelCell[] = [];
  private playerBoard: GameCell[][] = [];
  private enemyBoard: GameCell[][] = [];

  private state: GameState = "waiting";

  constructor() {
    super(PlayScene.key);
  }

  create() {
    for (let i = 0; i < 10; i++) {
      const playerXLabel = new LabelCell(
        this,
        String.fromCharCode("A".charCodeAt(0) + i),
      );
      const playerYLabel = new LabelCell(this, String(i + 1));
      playerXLabel.setActive(false);
      playerYLabel.setActive(false);
      this.playerXLabels.push(playerXLabel);
      this.playerYLabels.push(playerYLabel);

      const enemyXLabel = new LabelCell(
        this,
        String.fromCharCode("A".charCodeAt(0) + i),
      );
      const enemyYLabel = new LabelCell(this, String(i + 1));
      enemyXLabel.setActive(false);
      enemyYLabel.setActive(false);
      this.enemyXLabels.push(enemyXLabel);
      this.enemyYLabels.push(enemyYLabel);
    }

    this.scale.on(
      "resize",
      debounce(() => {
        this.calculateSize();
        this.updateBoards();
      }, 200),
    );
  }

  initGame(playerBoard: Readonly<Cell[][]>) {
    for (let i = 0; i < 10; i++) {
      const playerRow: GameCell[] = [];
      const enemyRow: GameCell[] = [];
      for (let j = 0; j < 10; j++) {
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

    this.playerBoard.forEach((row) =>
      row.forEach((item) => item.setActive(isHeroBoardActive)),
    );
    this.playerXLabels.forEach((item) => item.setActive(isHeroBoardActive));
    this.playerYLabels.forEach((item) => item.setActive(isHeroBoardActive));

    this.enemyBoard.forEach((row) =>
      row.forEach((item) => item.setActive(isEnemyBoardActive)),
    );
    this.enemyXLabels.forEach((item) => item.setActive(isEnemyBoardActive));
    this.enemyYLabels.forEach((item) => item.setActive(isEnemyBoardActive));

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        this.playerBoard[i][j].setState(playerBoard[i][j].state);
        this.enemyBoard[i][j].setState(enemyBoard[i][j].state);
      }
    }
  }

  private updateBoards(): void {
    for (let i = 0; i < 10; i++) {
      this.playerXLabels[i].update(
        {
          x: this.marginX + this.cellSize * (1 + i),
          y: this.marginY,
        },
        this.cellSize,
      );
      this.playerYLabels[i].update(
        {
          x: this.marginX,
          y: this.marginY + +this.cellSize * (1 + i),
        },
        this.cellSize,
      );
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const gameCell = this.playerBoard[i][j];
        gameCell.updatePosition(
          {
            x: this.marginX + (i + 1) * this.cellSize,
            y: this.marginY + (j + 1) * this.cellSize,
          },
          this.cellSize,
        );
      }
    }

    let marginX: number = this.marginX;
    let marginY: number = this.marginY;
    if (this.scale.isGamePortrait) {
      marginY = this.marginY + this.minMargin + (10 + 1) * this.cellSize;
    } else {
      marginX = this.marginX + this.minMargin + (10 + 1) * this.cellSize;
    }

    for (let i = 0; i < 10; i++) {
      this.enemyXLabels[i].update(
        {
          x: marginX + this.cellSize * (1 + i),
          y: marginY,
        },
        this.cellSize,
      );
      this.enemyYLabels[i].update(
        {
          x: marginX,
          y: marginY + +this.cellSize * (1 + i),
        },
        this.cellSize,
      );
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const gameCell = this.enemyBoard[i][j];
        gameCell.updatePosition(
          {
            x: marginX + (i + 1) * this.cellSize,
            y: marginY + (j + 1) * this.cellSize,
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
      x = (this.scale.width - 2 * this.minMargin) / 11;
      y = (this.scale.height - 3 * this.minMargin) / 22;
    } else {
      x = (this.scale.width - 3 * this.minMargin) / 22;
      y = (this.scale.height - 2 * this.minMargin) / 11;
    }

    this.cellSize = Math.min(x, y, this.maxCellSize);

    if (this.scale.isGamePortrait) {
      this.marginX = (this.scale.width - 11 * this.cellSize) / 2;
      this.marginY =
        (this.scale.height - 22 * this.cellSize - this.minMargin) / 2;
    } else {
      this.marginX =
        (this.scale.width - 22 * this.cellSize - this.minMargin) / 2;
      this.marginY = (this.scale.height - 11 * this.cellSize) / 2;
    }

    // this.sizeText?.setText(
    //   `${this.scale.isPortrait} ${Math.round(this.scale.width)} ${Math.round(
    //     this.scale.height,
    //   )}`,
    // );
  }

  private heroShot(x: number, y: number): void {
    if (this.state === "hero") {
      const event: MakeShotEvent = { x, y };
      this.game.events.emit(MAKE_SHOT_EVENT, event);
    }
  }
}
