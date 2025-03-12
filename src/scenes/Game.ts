import { Scene } from "phaser";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  pipes: Phaser.Physics.Arcade.Group;
  scoreText: Phaser.GameObjects.Text;
  score: number;
  spaceKey: Phaser.Input.Keyboard.Key;
  gameOver: boolean;
  pipeInterval: Phaser.Time.TimerEvent;

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x87ceeb); // Sky blue background

    // Add scrolling background
    this.background = this.add.image(512, 384, "background");
    this.background.setAlpha(1);

    // Initialize physics
    this.physics.world.setBounds(0, 0, 1024, 768);

    // Create player
    this.player = this.physics.add.sprite(200, 384, "logo");
    this.player.setScale(0.5);
    this.player.setCircle(30, 20, 20);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // Setup pipes group
    this.pipes = this.physics.add.group();

    // Initialize score
    this.score = 0;
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontFamily: "Arial Black",
      fontSize: "24px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    });

    // Input handling - Space key for jump
    this.spaceKey = this.input?.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    ) as Phaser.Input.Keyboard.Key;

    // Game status
    this.gameOver = false;

    // Start generating pipes
    this.pipeInterval = this.time.addEvent({
      delay: 1500,
      callback: this.addPipes,
      callbackScope: this,
      loop: true,
    });

    // Collision detection
    this.physics.add.collider(
      this.player,
      this.pipes,
      this.hitPipe,
      undefined,
      this
    );
  }

  update() {
    // If game over, stop updates
    if (this.gameOver) {
      return;
    }

    // Jump on space key press
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.jump();
    }

    // Rotate player based on velocity
    if (this.player.body.velocity.y > 0) {
      // Going down
      if (this.player.angle < 90) {
        this.player.angle += 2;
      }
    } else {
      // Going up
      if (this.player.angle > -30) {
        this.player.angle -= 5;
      }
    }

    // Check for scoring (passing pipes)
    this.pipes.getChildren().forEach((pipe: any) => {
      if (!pipe.scored && pipe.x < this.player.x) {
        // Only score for top pipes to avoid double counting
        if (pipe.y <= 0) {
          this.addScore();
          pipe.scored = true;
        }
      }

      // Remove pipes that are off screen
      if (pipe.x < -100) {
        pipe.destroy();
      }
    });

    // Game over if player hits bottom or top
    if (this.player.y >= 768 - this.player.height || this.player.y <= 0) {
      this.endGame();
    }
  }

  jump() {
    this.player.setVelocityY(-350);
  }

  addPipes() {
    if (this.gameOver) return;

    // Calculate gap position
    const gap = 180;
    const gapStart = Phaser.Math.Between(100, 668 - gap);

    // Create top pipe
    const topPipe = this.pipes.create(1100, gapStart - 320, "logo");
    topPipe.setOrigin(0.5, 1);
    topPipe.setImmovable(true);
    topPipe.setScale(0.7, 3);
    topPipe.body.setAllowGravity(false);
    topPipe.setVelocityX(-200);
    topPipe.scored = false;

    // Create bottom pipe
    const bottomPipe = this.pipes.create(1100, gapStart + gap, "logo");
    bottomPipe.setOrigin(0.5, 0);
    bottomPipe.setImmovable(true);
    bottomPipe.setScale(0.7, 3);
    bottomPipe.body.setAllowGravity(false);
    bottomPipe.setVelocityX(-200);
  }

  addScore() {
    this.score++;
    this.scoreText.setText("Score: " + this.score);
  }

  hitPipe() {
    this.endGame();
  }

  endGame() {
    this.gameOver = true;
    this.pipeInterval.remove();
    this.player.setTint(0xff0000);

    this.time.delayedCall(1500, () => {
      this.scene.start("GameOver", { score: this.score });
    });
  }
}
