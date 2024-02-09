declare interface Button extends Phaser.GameObjects.Sprite {}

declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    button(x: number, y: number, texture: string): Button;
  }
}
