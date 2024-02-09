const boardSize = 10;

export type ShotResult = "hit" | "miss" | "sank" | "game-over";

export type CellState = "empty" | "useless" | "ship" | "hit" | "miss";

export type Position = {
  x: number;
  y: number;
};

type ShipType = {
  decks: number;
  count: number;
};

type ShipDirection = "horizontal" | "vertical";

export class Ship {
  private hits: number = 0;

  constructor(
    readonly decks: number,
    readonly position: Position,
    readonly direction: ShipDirection,
  ) {}

  hit(): void {
    this.hits = Math.min(this.decks, this.hits + 1);
  }

  isSank(): boolean {
    return this.hits === this.decks;
  }
}

export type Cell = {
  state: CellState;
  position: Position;
  ship: Ship | null;
};

export type Shot = {
  result: ShotResult;
  affectedCells: Readonly<Cell[]>;
};

export interface PlayerBoard {
  getCells(): Readonly<Cell[][]>;

  takeShot(position: Position): Shot;
}

export interface EnemyBoard {
  getCells(): Readonly<Cell[][]>;

  applyShot(shot: Shot): void;
}

export class Board implements EnemyBoard, PlayerBoard {
  private cells: Cell[][] = [];

  private unsunkShipCount = 0;

  static createHeroBoard(): Board {
    const board = new Board();
    board.placeShips();

    return board;
  }

  constructor() {
    this.init();
  }

  getCells(): Readonly<Cell[][]> {
    return this.cells;
  }

  applyShot(shot: Shot): void {
    for (const affectedCell of shot.affectedCells) {
      this.cells[affectedCell.position.x][affectedCell.position.y].state =
        affectedCell.state;
    }
  }

  takeShot(position: Position): Shot {
    const cell = this.cells[position.x][position.y];
    let affectedCells: Cell[] = [cell];

    if (["empty", "miss", "useless"].includes(cell.state)) {
      cell.state = "miss";

      return {
        result: "miss",
        affectedCells,
      };
    }

    let result: ShotResult = "hit";
    if (cell.ship) {
      if (cell.state === "ship") {
        cell.ship.hit();
      }
      cell.state = "hit";

      if (cell.ship.isSank()) {
        result = "sank";
        this.unsunkShipCount -= 1;
        if (this.unsunkShipCount <= 0) {
          result = "game-over";
        }

        affectedCells = [];
        for (const position of this.calculateShipArea(cell.ship)) {
          const cell = this.cells[position.x][position.y];
          if (cell.state === "empty") {
            cell.state = "useless";
          }

          affectedCells.push(cell);
        }
      }
    }

    return {
      result,
      affectedCells,
    };
  }

  private init() {
    this.cells = [];
    for (let x = 0; x < boardSize; x++) {
      const row: Cell[] = [];
      for (let y = 0; y < boardSize; y++) {
        row.push({ state: "empty", ship: null, position: { x, y } });
      }

      this.cells.push(row);
    }
  }

  private placeShips() {
    const shipTypes: ShipType[] = [
      { decks: 4, count: 1 },
      { decks: 3, count: 2 },
      { decks: 2, count: 3 },
      { decks: 1, count: 4 },
    ];

    this.unsunkShipCount = 0;

    for (const shipType of shipTypes) {
      for (let i = 0; i < shipType.count; i++) {
        let placed = false;

        while (!placed) {
          const ship = new Ship(
            shipType.decks,
            {
              x: Math.floor(Math.random() * boardSize),
              y: Math.floor(Math.random() * boardSize),
            },
            Math.random() < 0.5 ? "horizontal" : "vertical",
          );

          if (this.canPlaceShip(ship)) {
            for (let j = 0; j < ship.decks; j++) {
              if (ship.direction === "horizontal") {
                this.cells[ship.position.x + j][ship.position.y].state = "ship";
                this.cells[ship.position.x + j][ship.position.y].ship = ship;
              } else {
                this.cells[ship.position.x][ship.position.y + j].state = "ship";
                this.cells[ship.position.x][ship.position.y + j].ship = ship;
              }
            }

            placed = true;
          }
        }

        this.unsunkShipCount += 1;
      }
    }
  }

  private canPlaceShip(ship: Ship): boolean {
    if (
      (ship.direction === "horizontal" &&
        ship.position.x + ship.decks >= boardSize) ||
      (ship.direction === "vertical" &&
        ship.position.y + ship.decks >= boardSize)
    ) {
      return false;
    }

    for (const position of this.calculateShipArea(ship)) {
      if (this.cells[position.x][position.y].state !== "empty") {
        return false;
      }
    }

    return true;
  }

  private calculateShipArea(ship: Ship): Position[] {
    const area: Position[] = [];

    const xMin = Math.max(0, ship.position.x - 1);
    const xMax = Math.min(
      boardSize - 1,
      ship.direction === "horizontal"
        ? ship.position.x + ship.decks
        : ship.position.x + 1,
    );
    const yMin = Math.max(0, ship.position.y - 1);
    const yMax = Math.min(
      boardSize - 1,
      ship.direction === "vertical"
        ? ship.position.y + ship.decks
        : ship.position.y + 1,
    );

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        area.push({ x, y });
      }
    }

    return area;
  }
}
