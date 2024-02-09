import { Position } from "../../engine/board.ts";
import { Scene } from "phaser";
import Text = Phaser.GameObjects.Text;
import TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export class LabelCell {
  private position: Position = { x: 0, y: 0 };
  private size: number = 0;
  private cell: Text;

  constructor(
    private scene: Scene,
    private label: string,
  ) {
    const labelStyle: TextStyle = {
      align: "center",
      color: "#3a59cb",
      fontFamily: "Hiddencocktails",
    };

    this.cell = this.scene.add
      .text(0, 0, this.label, labelStyle)
      .setVisible(false);
  }

  setActive(active: boolean): void {
    this.cell.setActive(active);

    this.updateCell();
  }

  update(position: Position, size: number): void {
    this.position = position;
    this.size = size;
    this.cell.setVisible(true);

    this.updateCell();
  }

  private updateCell(): void {
    const alpha = this.cell.active ? 1 : 0.3;

    this.cell.setPosition(this.position.x, this.position.y);
    this.cell.setFixedSize(this.size, this.size);
    this.cell.setFontSize(Math.floor(this.size * 0.94));
    this.cell.setAlpha(alpha);
  }
}
