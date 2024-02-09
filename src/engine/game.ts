import {
  Board,
  Cell,
  EnemyBoard,
  PlayerBoard,
  Position,
  Shot,
} from "./board.ts";

export type GameState = "waiting" | "hero" | "enemy" | "game-over";

export interface GameEngineInterface {
  startGame(initialState: GameState): void;

  getState(): GameState;

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

  constructor() {}

  startGame(initialState: GameState): void {
    this.heroBoard = Board.createHeroBoard();
    this.enemyBoard = new Board();

    this.state = initialState;
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

  applyHeroShotResult(shot: Shot): void {
    if (this.state !== "hero") {
      return;
    }

    this.enemyBoard.applyShot(shot);
    // if (shot.result === "miss") {
    this.state = "enemy";
    // }
    if (shot.result === "game-over") {
      this.state = "game-over";
    }
  }

  makeEnemyShot(position: Position): Shot | null {
    if (this.state !== "enemy") {
      return null;
    }

    const shot = this.heroBoard.takeShot(position);
    // if (shot.result === "miss") {
    this.state = "hero";
    // }
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
