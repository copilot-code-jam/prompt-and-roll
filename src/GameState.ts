type GameStatus = 'PLAY' | 'GAMEOVER' | 'WON';

export class GameState {
    private totalCoins: number;
    private currentLevel: number;
    private status: GameStatus;
    private earnStreak: number;
    private loseStreak: number;

    private static minCoinsPerLevel = new Map<number, number>([
        [1, 10],
        [2, 20],
        [3, 30]
    ]);

    private static rocksPerLevel = new Map<number, number>([
        [1, 5],
        [2, 10],
        [3, 15]
    ]);

    constructor() {
        this.totalCoins = 0;
        this.currentLevel = 1;
        this.status = 'PLAY';
        this.earnStreak = 0;
        this.loseStreak = 0;
    }

    public setTotalCoins(coins: number): void {
        this.totalCoins = coins;
    }

    public getTotalCoins(): number {
        return this.totalCoins;
    }

    public setCurrentLevel(level: number): void {
        this.currentLevel = level;
    }

    public getCurrentLevel(): number {
        return this.currentLevel;
    }

    public setStatus(status: GameStatus): void {
        this.status = status;
    }

    public getStatus(): GameStatus {
        return this.status;
    }

    public resetEarnStreak(): void {
        this.earnStreak = 0;
    }

    public resetLoseStreak(): void {
        this.loseStreak = 0;
    }

    public static getMinCoinsForLevel(level: number): number {
        return this.minCoinsPerLevel.get(level) || 0;
    }

    public static getRocksForLevel(level: number): number {
        return this.rocksPerLevel.get(level) || 0;
    }
}

export default GameState;
