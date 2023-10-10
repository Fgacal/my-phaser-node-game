import { GameIndexScene } from './gameIndexScene.js';

const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false // Puedes establecer esto en true para ver las colisiones en el juego
        }
        },
    scene: GameIndexScene,
};

const game = new Phaser.Game(gameConfig);

export { gameConfig }; // Exporta la configuración del juego
