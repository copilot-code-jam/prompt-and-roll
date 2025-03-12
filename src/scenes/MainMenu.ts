import { Scene, GameObjects } from 'phaser';
import { GameState } from '../GameState';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    level: GameObjects.Text;
    coins: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const gameState = new GameState();

        const level = gameState.getCurrentLevel();
        console.log("Level: " + level);

        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.level = this.add.text(0, 0, "Level: " + gameState.getCurrentLevel(), {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0, 0);

        this.coins = this.add.text(150, 0, "Coins: " + gameState.getTotalCoins(), {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0, 0);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
