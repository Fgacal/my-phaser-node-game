class CreateRoomScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreateRoomScene' });
        this.socket = io();
        this.height = 50;
        this.localPlayer = null;
        this.players = []
    }

    init(data) {
        this.joinPlayer = data;
        if (data.joinPlayer) {
            this.socket.emit('player-joined', data);
        }
    }
    create() {

        let center_width = this.sys.game.config.width / 2;
        let center_height = this.sys.game.config.height / 2;

        this.socket.on('startGameScene', (players) => {
            this.scene.start('OnlineMultiplayerScene',players)
  
        }); 
        this.socket.on('player-disconnected', (disconnectedPlayer) => {
            if (disconnectedPlayer.isHost == true) {
                alert('host desconectado')
                this.scene.start('MenuOnlineScene')
            }
            this.disconnectedPlayerText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, '¡El jugador se ha desconectado!', {
                fontFamily: 'Arial',
                fontSize: '36px',
                fill: '#ffffff',
                align: 'center',
            }).setOrigin(0.5);
        });

        this.socket.on('startGameScene', (players) => {
            this.scene.start('OnlineMultiplayerScene');
        })
        this.socket.on('activeStartGameButton', (result) => {
            if (result && this.localPlayer.isHost == true) {
                this.createButton(center_width, center_height + 100, 'start_button', this.socket)
            }
            else {
                if (this.startButton) {
                    this.startButton.destroy()
                }
            }
        })
        this.socket.on('updateCheckboxAppearanceOnline', (player) => {
            if (player.id != this.socket.id && this.players[player.id].id == player.id) {
                if (player.checkboxBox.name == 'true') {
                    this.players[player.id].checkboxBox.setFillStyle(0x00ff00);
                } else {
                    this.players[player.id].checkboxBox.setFillStyle(0xff0000);
                }
            }
        })

        this.socket.on('join-playerOnline', (playerHost) => {
            for (const playerInfo of playerHost) {
                if ((playerInfo) && playerInfo.id != this.socket.id) {
                    this.joinToRoom(playerInfo)
                }
                if ((playerInfo) && this.joinPlayer.joinPlayer && playerInfo.id === this.socket.id) {
                    this.joinToRoom(playerInfo)
                }
            }
        })

        let graphics = this.add.graphics();
        graphics.fillStyle(0xFAD7A0, 1)
        graphics.fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height)
        this.titleText = this.add.text(center_width, this.sys.game.config.height / 4, "Room", {
            color: "#85C1E9",
            fontFamily: "bunge",
            fontSize: 40
        }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);
        this.titleText.setOrigin(0.5);

        // Emite el evento para obtener las salas activas
        if ((this.joinPlayer.joinPlayer == false) && this.joinPlayer.hostPlayer) {
            this.socket.emit('create-room');
            this.socket.on('room-created', (playerHost) => {
                this.joinToRoom(playerHost)

            })
        }


    }

    /*    createMenuButton(y, text, sceneKey, roomInfo = null) {
           const button = this.add.text(400, y, text, {
               color: "#fff",
               fontFamily: "bunge",
               fontSize: 20
           }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);
           button.setOrigin(0.5);
           button.setInteractive();
   
           // Cambia el color al pasar el puntero sobre el botón
           button.on('pointerover', () => {
               this.a.play();
               button.setColor('#85C1E9');
           });
   
           // Restaura el color original cuando el puntero sale del botón
           button.on('pointerout', () => {
               button.setColor('#fff');
           });
   
           // Inicia la escena correspondiente al hacer clic en el botón
           if(sceneKey){
               button.on('pointerdown', () => {
                   this.audio.stop();
                   this.scene.start(sceneKey, roomInfo);
               });
           }
       } */
    updateCheckboxAppearance() {
        /* if(this.localPlayer.id === this.socket.id){ */
        if (this.checkboxChecked) {
            this.localPlayer.checkboxBox.name = 'true';
            this.socket.emit('pressCheckbox', this.localPlayer);
            // Si el checkbox está marcado, lo coloreamos de verde
            this.localPlayer.checkboxBox.setFillStyle(0x00ff00);
        } else {
            this.localPlayer.checkboxBox.name = 'false';
            this.socket.emit('pressCheckbox', this.localPlayer);
            // Si no está marcado, lo coloreamos de rojo
            this.localPlayer.checkboxBox.setFillStyle(0xff0000);
        }
        /*  } */
    }

    joinToRoom(player) {
        player.player == 2 ? this.height = 0 : this.height
        let center_width = this.sys.game.config.width / 2;
        let center_height = this.sys.game.config.height / 2;
        this.add.text(center_width - 200, this.sys.game.config.height / 2 - this.height, `* Player : ${player.player} Color :  ${player.color}`, {
            color: "#FFFFFF",
            fontFamily: "Lucida Console",
            fontSize: 20,
            backgroundColor: player.player == 1 ? "#006CFF" : "#E74C3C",
        }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);
        this.add.text(center_width + 150, this.sys.game.config.height / 2 - this.height, 'Listo :',
            {
                color: "#FFFFFF",
                fontFamily: "Lucida Console",
                fontSize: 20,
            }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);

        // Crear un rectángulo que simulará el checkbox
        if (this.socket.id === player.id) {
            const checkboxBox = this.add.rectangle(center_width + 250, this.sys.game.config.height / 2 - (this.height - 10), 20, 20, '0x00ff00').setStrokeStyle(1, '#0000');
            checkboxBox.setInteractive();
            this.localPlayer = player;
            this.localPlayer.checkboxBox = checkboxBox
            // Agregar un evento de clic al rectángulo para alternar el estado del checkbox
            checkboxBox.on('pointerdown', () => {
                this.checkboxChecked = !this.checkboxChecked;
                this.updateCheckboxAppearance();
            });

            // Inicializar la apariencia del checkbox
            this.updateCheckboxAppearance();
        } else {
            this.players[player.id] = player
            const checkboxBox = this.add.rectangle(center_width + 250, this.sys.game.config.height / 2 - (this.height - 10), 20, 20, '0xff0000').setStrokeStyle(1, '#0000').setInteractive();
            this.players[player.id].checkboxBox = checkboxBox;
        }
    }


    createButton(x, y, imageKey, self) {
        this.startButton = this.add.sprite(x, y, imageKey).setInteractive();
        this.startButton.setDepth(1);
        this.startButton.setScale(0.1);
        // Escalar el botón cuando el mouse pasa sobre él
        this.startButton.on('pointerover', (pointer) => {
            this.startButton.setScale(0.2);
        });

        // Restablecer la escala del botón cuando el mouse sale de él
        this.startButton.on('pointerout', (pointer) => {
            this.startButton.setScale(0.1);
        });
        // Agregar una animación de clic al botón
        this.startButton.on('pointerdown', (pointer) => {
            this.startButton.setScale(0.2); // Escalar hacia abajo
            this.tweens.add({
                targets: this,
                scaleX: 1, // Restablecer la escala en X
                scaleY: 1, // Restablecer la escala en Y
                ease: 'Power1',
                duration: 200, // Duración de la animación en milisegundos
                onComplete: () => {
                    if (this.socket) {
                        // Emitir un evento al servidor, por ejemplo 'startGame'
                        this.socket.emit('startGame', this.localPlayer);
                    }
                },
            });
        });
    }

}

export default CreateRoomScene;
