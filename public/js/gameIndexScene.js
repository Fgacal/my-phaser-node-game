export class GameIndexScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameIndexScene' });
    }
  
    preload() {
      this.load.image('circle', '/assets/circle.png');
    }
  
    create() {
      const self = this;
      this.socket = io();
      this.players = this.physics.add.group();
      this.playerId = localStorage.getItem('playerId'); // Obtiene el playerId del almacenamiento local
  
      if (!this.playerId) {
        this.playerId = this.generatePlayerId();
        localStorage.setItem('playerId', this.playerId);
        this.socket.emit('set-player-id', this.playerId);
      }
  
  
      this.socket.on('all-player-info', (playerIds) => {
        playerIds.forEach((id) => {
          if (id !== self.playerId) {
            self.createPlayer(id, 0, 0);
          }
        });
      });
  
      this.socket.on('all-player-positions', (playerPositions) => {
        Object.keys(playerPositions).forEach((id) => {
          if (id !== self.playerId) {
            const player = self.players.getChildren().find((p) => p.name === id);
            if (player) {
              const { x, y } = playerPositions[id];
              player.x = x;
              player.y = y;
            }
          }
        });
      });
  
      this.socket.on('player-moved', (data) => {
        const player = self.players.getChildren().find((p) => p.name === data.id);
        if (player) {
          const duration = 300;
          const startX = player.x;
          const startY = player.y;
          const endX = data.x;
          const endY = data.y;
  
          self.tweens.add({
            targets: player,
            x: endX,
            y: endY,
            duration: duration,
            ease: 'Linear',
          });
        }
      });
  
      this.input.on('pointermove', (pointer) => {
        const { x, y } = pointer;
        self.socket.emit('player-move', { id: self.playerId, x, y });
      });
    }
  
    update() {
      // Lógica de actualización del juego
    }
  
    createPlayer(id, x, y) {
      const player = this.physics.add.sprite(x, y, 'circle');
      player.name = id;
      player.displayWidth = 50;
      player.displayHeight = 50;
      this.players.add(player);
      player.setCollideWorldBounds(true);
    }
  
    generatePlayerId() {
      return 'player-' + Phaser.Math.RND.uuid();
    }
  }
  