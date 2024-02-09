import Graphics = Phaser.GameObjects.Graphics;
import { CellState, Position } from "../../engine/board.ts";
import { Scene } from "phaser";
import GAMEOBJECT_POINTER_DOWN = Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN;
import Rectangle = Phaser.Geom.Rectangle;

export class GameCell {
  private position: Position = { x: 0, y: 0 };
  private size: number = 0;
  private state: CellState = "empty";

  private cell: Graphics;

  constructor(
    private scene: Scene,
    onClick?: () => void,
  ) {
    this.cell = this.scene.add.graphics().setVisible(false);
    if (onClick) {
      this.cell.on(GAMEOBJECT_POINTER_DOWN, onClick);

      this.cell.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(0, 0, 0, 0),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true,
      });
    }
  }

  updatePosition(position: Position, size: number): void {
    this.position = position;
    this.size = size;
    this.cell.setVisible(true);

    this.updateCell();
  }

  setState(state: CellState): void {
    this.state = state;
  }

  updateState(state: CellState): void {
    this.state = state;
    this.cell.setVisible(true);

    this.updateCell();
  }

  setActive(active: boolean): void {
    this.cell.setActive(active);

    this.updateCell();
  }

  private updateCell(): void {
    const alpha = this.cell.active ? 1 : 0.3;

    this.cell.clear();

    this.cell.fillStyle(0xffffff, alpha);
    if (this.state === "ship") {
      this.cell.fillStyle(0xaebbea, alpha);
    } else if (this.state === "useless") {
      this.cell.fillStyle(0xd2f5e0, alpha);
    } else if (this.state === "hit") {
      this.cell.fillStyle(0xf68282, alpha);
    }
    this.cell.fillRect(this.position.x, this.position.y, this.size, this.size);

    this.cell.lineStyle(2, 0x3a59cb, alpha);
    this.cell.strokeRect(
      this.position.x,
      this.position.y,
      this.size,
      this.size,
    );

    if (this.state === "miss") {
      this.cell.fillStyle(0x3a59cb, alpha);
      this.cell.fillCircle(
        this.position.x + this.size / 2,
        this.position.y + this.size / 2,
        this.size * 0.15,
      );
    }

    if (this.cell.input?.hitArea) {
      const area = this.cell.input?.hitArea as Rectangle;
      area.setTo(this.position.x, this.position.y, this.size, this.size);
    }
  }
}
