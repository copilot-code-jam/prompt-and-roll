import { Scene } from 'phaser';
import { GameState } from '../GameState';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text: Phaser.GameObjects.Text;
    score_text: Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    init(data: any)
    {
        // Get the score from the Game scene
        this.registry.set('score', data.score || 0);
    }

    create ()
    {
        const gameState = GameState.getInstance();

        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.gameover_text = this.add.text(512, 334, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);
        
        // Display the final score
        const score = this.registry.get('score') || 0;
        this.score_text = this.add.text(512, 434, `Score: ${score}`, {
            fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        });
        this.score_text.setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
