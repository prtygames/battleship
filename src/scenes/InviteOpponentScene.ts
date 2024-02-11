import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;
import QRCode from "qrcode";
import Image = Phaser.GameObjects.Image;
import debounce from "debounce";
import GAMEOBJECT_POINTER_DOWN = Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN;
import Rectangle = Phaser.Geom.Rectangle;

export class InviteOpponentScene extends Phaser.Scene {
  static readonly key: string = "invite_opponent";

  private title!: Text;
  private qrcode: Image | undefined;

  private joinUrl: string = "";

  constructor() {
    super(InviteOpponentScene.key);
  }

  init(data: { joinUrl: string }) {
    this.joinUrl = data.joinUrl;
  }

  async preload() {
    if (!this.qrcode) {
      console.log(this.joinUrl);

      QRCode.toDataURL(this.joinUrl, {
        type: "image/png",
        color: { dark: "#415fcc" },
        width: 250,
        margin: 1,
      }).then((qrcode) => {
        this.textures.addBase64("qrcode", qrcode);
      });

      this.textures.once("addtexture-qrcode", () => {
        this.qrcode = this.add.image(0, 0, "qrcode");
        if (navigator.share) {
          this.qrcode.on(GAMEOBJECT_POINTER_DOWN, async () => {
            try {
              await navigator.share({
                title: "Battleship",
                text: "Let's go Play!",
                url: this.joinUrl,
              });
            } catch (ignore) {}
          });

          this.qrcode.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, 0, 0),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true,
          });
        }

        this.resize();
      });
    }
  }

  create() {
    this.title = this.add.text(0, 0, "Invite", {
      align: "center",
      color: "#415fcc",
      fontFamily: "Hiddencocktails",
      padding: { bottom: 10 },
    });

    this.scale.on(
      "resize",
      debounce(() => this.resize(), 200),
    );

    this.resize();
  }

  private resize() {
    if (this.scene.isVisible(InviteOpponentScene.key)) {
      if (this.title) {
        this.title.setFontSize(
          Math.min(Math.min(this.scale.width, this.scale.height) / 4, 150),
        );
        this.title.setPosition(this.scale.width / 2, this.scale.height / 4);
        this.title.setOrigin(0.5, 1);
      }

      if (this.qrcode) {
        this.qrcode.setPosition(this.scale.width / 2, this.scale.height / 4);
        this.qrcode.setOrigin(0.5, 0);
        const scale = Math.min(
          Math.min(this.scale.width, (3 * this.scale.height) / 4) / 250,
          1,
        );

        this.qrcode.setScale(scale, scale);

        if (this.qrcode.input?.hitArea) {
          const area = this.qrcode.input?.hitArea as Rectangle;

          area.setTo(
            this.qrcode.displayOriginX - this.qrcode.displayWidth / 2,
            this.qrcode.displayOriginY,
            this.qrcode.displayWidth,
            this.qrcode.displayHeight,
          );
        }
      }
    }
  }
}
