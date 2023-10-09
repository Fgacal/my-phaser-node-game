import { GameIndexScene } from './gameIndexScene.js';

const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: GameIndexScene,
};

const game = new Phaser.Game(gameConfig);

export { gameConfig }; // Exporta la configuración del juego
