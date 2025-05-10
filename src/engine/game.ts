import {
  Board,
  Cell,
  EnemyBoard,
  PlayerBoard,
  Position,
  ShipType,
  Shot,
} from "./board.ts";

export type GameState = "waiting" | "hero" | "enemy" | "game-over";

export interface GameEngineInterface {
  initGame(initialState: GameState): void;

  startGame(): void;

  getState(): GameState;

  setState(state: GameState): void;

  replaceHeroShips(): void;

  getHeroBoard(): Readonly<Cell[][]>;

  getEnemyBoard(): Readonly<Cell[][]>;

  applyHeroShotResult(shot: Shot): void;

  makeEnemyShot(position: Position): Shot | null;

  log(): void;
}

export class GameEngine implements GameEngineInterface {
  private heroBoard!: PlayerBoard;

  private enemyBoard!: EnemyBoard;

  private state!: GameState;

  private initialState!: GameState;

  constructor(
    private boardSize: number,
    private shipTypes: ShipType[],
  ) {}

  initGame(initialState: GameState): void {
    this.heroBoard = Board.createHeroBoard(this.boardSize, this.shipTypes);
    this.enemyBoard = new Board(this.boardSize, this.shipTypes);

    this.initialState = initialState;
  }

  startGame(): void {
    this.state = this.initialState;
  }

  replaceHeroShips(): void {
    this.heroBoard = Board.createHeroBoard(this.boardSize, this.shipTypes);
  }

  getHeroBoard(): Readonly<Cell[][]> {
    return this.heroBoard.getCells();
  }

  getEnemyBoard(): Readonly<Cell[][]> {
    return this.enemyBoard.getCells();
  }

  getState(): GameState {
    return this.state;
  }

  setState(state: GameState): void {
    this.state = state;
  }

  applyHeroShotResult(shot: Shot): void {
    if (this.state !== "hero") {
      return;
    }

    this.enemyBoard.applyShot(shot);
    if (shot.result === "miss") {
      this.state = "enemy";
    }
    if (shot.result === "game-over") {
      this.state = "game-over";
    }
  }

  makeEnemyShot(position: Position): Shot | null {
    if (this.state !== "enemy") {
      return null;
    }

    const shot = this.heroBoard.takeShot(position);
    if (shot.result === "miss") {
      this.state = "hero";
    }
    if (shot.result === "game-over") {
      this.state = "game-over";
    }

    return shot;
  }

  log() {
    this.logBoard(this.heroBoard.getCells());
    this.logBoard(this.enemyBoard.getCells());
  }

  private logBoard(board: Readonly<Cell[][]>): void {
    let s = "";
    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[x].length; y++) {
        switch (board[y][x].state) {
          case "empty":
            s += "⃞";
            break;
          case "useless":
            s += "⬜";
            break;
          case "ship":
            s += "⬛";
            break;
          case "hit":
            s += "❌";
            break;
          case "miss":
            s += "🔲";
            break;
        }
      }
      s += "\n";
    }

    console.log(s);
  }
}
