import { GameObjects, Scene } from "phaser";
import { GameState, DialogCategory } from "../GameState";
import { FlashText, MessageType } from "../utils/FlashText";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  pipes: Phaser.Physics.Arcade.Group;
  stars: Phaser.Physics.Arcade.Group;
  scoreText: Phaser.GameObjects.Text;
  spaceKey: Phaser.Input.Keyboard.Key;
  gameOver: boolean;
  pipeInterval: Phaser.Time.TimerEvent;
  starInterval: Phaser.Time.TimerEvent;
  level: GameObjects.Text;
  coins: GameObjects.Text;
  score: number;
  gameState: GameState;
  flashText: FlashText;
  sentimentTalks: Record<DialogCategory, string[]>;

  constructor() {
    super("Game");
    this.gameState = GameState.getInstance();
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

    // Setup stars group
    this.stars = this.physics.add.group();

    // Initialize score
    this.score = this.gameState.getScore();
    this.scoreText = this.add
      .text(300, 0, "Score: " + this.gameState.getScore(), {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0, 0);

    this.level = this.add
      .text(0, 0, "Level: " + this.gameState.getCurrentLevel(), {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0, 0);

    this.coins = this.add
      .text(150, 0, "Coins: " + this.gameState.getTotalCoins(), {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0, 0);

    // Setup flash text
    this.flashText = new FlashText(this, 512, 384);

    // Load sentiment talks
    fetch("src/trash-talk.json")
      .then((response) => response.json())
      .then((data) => {
        this.sentimentTalks = data.sentiment_type_talks;
        this.flashText.setMessages(this.sentimentTalks);
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

    // Start generating stars
    this.starInterval = this.time.addEvent({
      delay: 2000,
      callback: this.addStar,
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

    // Add star collection collision
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
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

    // Remove stars that are off screen
    this.stars.getChildren().forEach((star: any) => {
      if (star.x < -50) {
        star.destroy();
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

  addStar() {
    if (this.gameOver) return;

    const star = this.stars.create(
      1100,
      Phaser.Math.Between(100, 668),
      "cyan-star"
    );
    star.setScale(0.5);
    star.setCircle(25);
    star.body.setAllowGravity(false);
    star.setVelocityX(-200);
  }

  collectStar(
    _:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
      | Phaser.Physics.Arcade.Body,
    star:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
      | Phaser.Physics.Arcade.Body
  ) {
    (star as Phaser.GameObjects.GameObject).destroy();
    this.gameState.setScore(this.gameState.getScore() + 5);
    this.score += this.gameState.getScore();
    this.scoreText.setText("Score: " + this.score);
    this.showFlashMessage(this.gameState);
  }

  addScore() {
    this.score++;
    this.scoreText.setText("Score: " + this.score);
    if (this.score % 5 === 0) {
      this.showFlashMessage("neutral");
    }
  }

  showFlashMessage(type: DialogCategory) {
    if (!this.sentimentTalks) return;

    this.flashText.show(this.sentimentTalks[type.toLowerCase()]);
  }

  hitPipe() {
    this.showFlashMessage("negative");
    this.endGame();
  }

  endGame() {
    this.gameOver = true;
    this.pipeInterval.remove();
    this.starInterval.remove();
    this.player.setTint(0xff0000);

    // this.time.delayedCall(1500, () => {
    //   this.scene.start("GameOver", { score: this.score });
    // });
  }
}
