import PlayerGameObject from './playerGameObject.js';

export class GameIndexScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameIndexScene' });
        this.playerGameObjects = {}; // Objeto para almacenar las instancias de PlayerGameObject
    }

    preload() {
        this.load.spritesheet('player', '/assets/img/sprite.png', {
            frameWidth: 50,
            frameHeight: 50,
        });
    }

    create() {
        const self = this;
        this.players = this.physics.add.group();

        this.socket = io();

        this.socket.on('set-player-id', (playerId) => {
            const storedPlayerId = sessionStorage.getItem('playerId'); // Usa sessionStorage
            if (storedPlayerId) {
              this.playerId = storedPlayerId;
            } else {
              this.playerId = playerId;
              sessionStorage.setItem('playerId', playerId); // Almacena el nuevo ID en sessionStorage
            }
          });

        this.socket.on('player-connected', (playersData) => {
            playersData.forEach((playerData) => {
                if (playerData.id !== self.playerId) {
                    self.createPlayer(playerData);
                }
            });
        });

        this.socket.on('player-disconnected', (playerId) => {
            const player = this.players.getChildren().find((p) => p.name === playerId);
            if (player) {
                player.destroy();
            }
        });

        this.socket.on('player-moved', (playerData) => {
            const player = this.players.getChildren().find((p) => p.name === playerData.id);
            if (player) {
                player.x = playerData.x;
                player.y = playerData.y;
            } else {
                self.createPlayer(playerData);
            }
        });

        this.input.on('pointermove', (pointer) => {
            const { x, y } = pointer;
            self.socket.emit('player-move', { x, y });
        });
    }

    update() {
        // Lógica de actualización del juego
    }

    createPlayer = (playerData) => {
        // Verifica si ya existe una instancia para este jugador
        if (!this.playerGameObjects[playerData.id]) {
            // Crea una nueva instancia solo si no existe
            const playerGameObject = new PlayerGameObject(
                this,
                playerData.x,
                playerData.y,
                'player',
                playerData.id
            );
            // Almacena la instancia en el objeto de seguimiento
            this.playerGameObjects[playerData.id] = playerGameObject;
        }
    }
}
