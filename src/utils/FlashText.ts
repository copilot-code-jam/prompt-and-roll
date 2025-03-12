import { Scene } from "phaser";
import { DialogCategory } from "../GameState";

export type MessageType = "positive" | "negative" | "neutral";

export class FlashText {
  private text: Phaser.GameObjects.Text;
  private scene: Scene;
  private messages: Record<MessageType, string[]>;

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene;
    this.text = scene.add.text(x, y, "", {
      fontFamily: "Arial Black",
      fontSize: "32px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 6,
    });
    this.text.setOrigin(0.5);
    this.text.setAlpha(0);
    this.messages = {} as Record<DialogCategory, string[]>;
  }

  setMessages(messages: Record<MessageType, string[]>) {
    this.messages = messages;
  }

  show(type: DialogCategory) {
    if (!this.messages[type]) return;

    const messages = this.messages[type];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    this.text.setText(randomMessage);
    this.text.setAlpha(1);

    this.scene.tweens.add({
      targets: this.text,
      alpha: 0,
      duration: 3000,
      ease: "Power2",
    });
  }

  destroy() {
    this.text.destroy();
  }
}
