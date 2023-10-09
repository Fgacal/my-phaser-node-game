// game.js
import Phaser from 'phaser';
import { GameScene } from './gameScene.js';

const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: GameScene,
};

const game = new Phaser.Game(gameConfig);

export { gameConfig }; // Exporta la configuración del juego
