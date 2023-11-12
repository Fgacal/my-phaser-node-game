import palas from '../gameObjects/palas.js';
import campo from '../gameObjects/campo.js'

class OnlineMultiplayerScene extends Phaser.Scene {
    constructor() {
        super({ key: "OnlineMultiplayerScene" })
        this.socket = io();
        this.localPlayerColor = '';  // Color del jugador local
        this.players = {};  // Objeto para mantener la información de los jugadores
        this.localPlayer = null;
        this.gameStarted = false;  // Indicador de si la partida ha comenzado
    }


    create() {
        let center_width = this.sys.game.config.width / 2;
        let center_height = this.sys.game.config.height / 2;

    /*     this.socket.emit('player-joined'); */


        this.waitingText = this.add.text(center_width, this.sys.game.config.height / 4, 'esperando jugadores ....', {
            fontFamily: 'Arial',
            fontSize: '36px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5).setDepth(1);;


        this.waitingText.setOrigin(0.5);
        this.scene.pause("OnlineMultiplayerScene");


        this.socket.on('start-game', (ball) => {
            console.log('start game')
            this.waitingText.setVisible(false);
            this.scene.resume("OnlineMultiplayerScene");
            if (this.disconnectedPlayerText) {
                this.disconnectedPlayerText.setVisible(false);
            }
            this.createBall(ball);  // Llama a una función para crear la bola
            this.physics.add.collider(this.bola, this.localPlayer, this.chocapala, null, this);
            this.physics.add.collider(this.bola, this.players[Object.keys(this.players)[0]], this.chocapala, null, this);
            this.physics.add.collider(this.bola, this.top);
            this.physics.add.collider(this.bola, this.bot);
            this.physics.add.collider(this.bola, this.p1, this.chocapared, null, this);
            this.physics.add.collider(this.bola, this.p2, this.chocapared, null, this);
            this.physics.add.collider(this.bola, this.p3, this.chocapared, null, this);
            this.physics.add.collider(this.bola, this.p4, this.chocapared, null, this);
            this.physics.add.collider(this.bola, this.p5, this.chocapared, null, this);
            this.physics.add.collider(this.bola, this.p6, this.chocapared, null, this);
            this.pintarMarcador();
            this.gameStarted = true;
        });



        this.socket.on('player-disconnected', (disconnectedPlayer) => {
            this.scene.pause("OnlineMultiplayerScene");
            this.disconnectedPlayerText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, '¡El jugador se ha desconectado!', {
                fontFamily: 'Arial',
                fontSize: '36px',
                fill: '#ffffff',
                align: 'center',
            }).setOrigin(0.5);
        });

        this.socket.on('player-info', (player) => {
            /*    this.createPlayer(this, player); */
            /*    this.physics.world.collide(this.players[this.socket.id], [this.p1, this.p2, this.p3, this.p4, this.p5], this.choca, null, this); */
        });

        this.socket.on('all-players', (allPlayers) => {
            for (const playerInfo of allPlayers) {
                if (this.players && !this.players[playerInfo.id] && playerInfo.id != this.socket.id) {
                    // Crear un nuevo jugador si no existe
                    this.createPlayer(this, playerInfo);
                } else {
                    this.createPlayer(this, playerInfo);
                    // Actualizar la información de jugadores existentes
                    /*   this.players[playerInfo.id].color = playerInfo.color; */
                }
            }
        });


        // Escucha las actualizaciones de otros jugadores y actualiza sus posiciones.
        this.socket.on('player-updated', (playerData) => {
            if (playerData.playerId !== this.socket.id) {
                if (this.players[playerData.playerId]) {
                    this.players[playerData.playerId].x = playerData.position.x;
                    this.players[playerData.playerId].y = playerData.position.y;
                }
            }
        });
        // Escucha el evento "player-moved" emitido por el servidor
        this.socket.on('player-moved', (data) => {
            const { id, position } = data;
            if (this.players[id]) {
                // Actualiza la posición del jugador con ID correspondiente
                this.players[id].x = position.x;
                this.players[id].y = position.y;
            }
        });


        this.socket.on('ball-updated', (ball) => {
            this.updateBallPosition(ball);
        });

        this.audio = this.sound.add("a");
        this.punto = this.sound.add("punto");

        //separador
        this.add.image(center_width, center_height, "campo1")


        this.p1 = this.physics.add.staticImage(50, 35, "p1").setScale(1.3);
        this.p2 = this.physics.add.staticImage(399, 7, "p2").setScale(1.3);
        this.p3 = this.physics.add.staticImage(751, 36, "p3").setScale(1.3);
        this.p4 = this.physics.add.staticImage(50, 364, "p4").setScale(1.3);
        this.p5 = this.physics.add.staticImage(399, 393, "p5").setScale(1.3);
        this.p6 = this.physics.add.staticImage(751, 364, "p6").setScale(1.3);

        this.add.image(center_width, center_height, "campo3")
        this.socket.on('actualizar-marcador', (player) => {
            if (player.player == 2 && player.color == 'red') {
                this.marcador1.text = player.score.toString();
            }
            else if (player.player == 1 && player.color == 'blue') {
                this.marcador2.text = player.score.toString();
            }
            this.punto.play();
            this.empezar();
        });

    }


    empezar() {
        this.bola.setPosition(400, 200);
        let anguloInicial = Math.PI / 4 - Math.random() * Math.PI / 2;
        const derechaOIzq = Math.floor(Math.random() * 2);
        console.log(anguloInicial);
        if (derechaOIzq === 1) anguloInicial = anguloInicial + Math.PI;
        const vx = Math.cos(anguloInicial) * this.velocidad;
        const vy = Math.sin(anguloInicial) * this.velocidad;
        this.bola.body.velocity.x = vx;
        this.bola.body.velocity.y = vy;
    }

    pintarMarcador() {
        this.marcador1 = this.add.text(50, 10, '0', { fontFamily: 'Arial', fontSize: 30, color: '#f00', align: 'right' }).setOrigin(1, 0).setShadow(2, 2, 'rgba(0,0,0,1)', 0);;
        this.marcador2 = this.add.text(750, 10, '0', { fontFamily: 'Arial', fontSize: 30, color: '#3498DB', }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);

    }


    update(time, delta) {
        this.bola.rotation += 0.1;
        
        if (this.gameStarted && this.bola) {
            // Comprueba si la posición de la bola ha cambiado significativamente
            if (this.bola.oldX !== this.bola.x || this.bola.oldY !== this.bola.y) {
                this.socket.emit('ball-moved', { x: this.bola.x, y: this.bola.y });
                this.bola.oldX = this.bola.x;
                this.bola.oldY = this.bola.y;
            }
        }


        // Cuando el jugador anota un punto
        if (this.bola.x < 0) { 
            if(this.localPlayer.color == 'blue' && this.localPlayer.player == 1){
              this.point()
            }
        } else if (this.bola.x > this.sys.game.config.width) {
            if(this.localPlayer.color == 'red' && this.localPlayer.player == 2){
                this.point()
            }
        }



        if (this.localPlayerColor === 'red') {
            if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP), 0)) {
                this.localPlayer.body.setVelocityY(-300);
                this.socket.emit('player-moved', { x: this.localPlayer.x, y: this.localPlayer.y });
            } else if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN), 0)) {
                this.localPlayer.body.setVelocityY(300);
                this.socket.emit('player-moved', { x: this.localPlayer.x, y: this.localPlayer.y });
            } else {
                this.localPlayer.body.setVelocityY(0);
                this.socket.emit('player-moved', { x: this.localPlayer.x, y: this.localPlayer.y });
            }
        } else if (this.localPlayerColor === 'blue') {
            if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP), 0)) {
                this.localPlayer.body.setVelocityY(-300);
                this.socket.emit('player-moved', { x: this.localPlayer.x, y: this.localPlayer.y });
            } else if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN), 0)) {
                this.localPlayer.body.setVelocityY(300);
                this.socket.emit('player-moved', { x: this.localPlayer.x, y: this.localPlayer.y });
            } else {
                this.localPlayer.body.setVelocityY(0);
                this.socket.emit('player-moved', { x: this.localPlayer.x, y: this.localPlayer.y });
            }
        }
    }

    chocapala() {
        this.bola.anims.play('pelota');
        this.bola.setVelocityY(Phaser.Math.Between(-160, 160));
        this.audio.play();

    }
    chocapared() {
        this.audio.play();
    }
    // Función para crear un jugador en función de la información del servidor
    createPlayer(scene, playerInfo) {
        const { id, color } = playerInfo;

        // Determinar si el jugador es local o en línea
        if (id === this.socket.id) {
            // Este jugador es el jugador local
            this.localPlayerColor = color;
            if (color === 'red') {
                this.localPlayer = new palas(scene, 130, scene.sys.game.config.height / 2, 'izquierda').setScale(0.7);
            } else if (color === 'blue') {
                this.localPlayer = new palas(scene, scene.sys.game.config.width - 130, scene.sys.game.config.height / 2, 'derecha').setScale(0.7);
            }
            // Configurar los controles del jugador local
            /* this.setupLocalPlayerControls(this.localPlayer); */
            this.localPlayer.id = playerInfo.id
            this.localPlayer.color = playerInfo.color
            this.localPlayer.score = playerInfo.score
            this.localPlayer.player = playerInfo.player
            this.localPlayer.room = playerInfo.room
        } else {
            // Este jugador es en línea
            let player;
            if (color === 'red') {
                // Crea al jugador rojo
                player = new palas(scene, 130, scene.sys.game.config.height / 2, 'izquierda').setScale(0.7);
            } else if (color === 'blue') {
                // Crea al jugador azul
                player = new palas(scene, scene.sys.game.config.width - 130, scene.sys.game.config.height / 2, 'derecha').setScale(0.7);
            }
            player.id = playerInfo.id
            player.color = playerInfo.color
            player.score = playerInfo.score
            player.player = playerInfo.player
            player.room = playerInfo.room

            this.players[id] = player;
        }
    }

    createBall(ball) {
        if (!this.bola) {
            this.bola = this.physics.add.sprite(ball.x, ball.y, "bolaa").setScale(0.5);
            this.anims.create({
                key: "pelota",
                frames: this.anims.generateFrameNumbers('bolaa', {
                    frames: [0, 1]
                }),
                repeat: 0,
                frameRate: 3
            });
            this.bola.oldX = 0;
            this.bola.oldY = 0;
            this.physics.world.setBoundsCollision(false, false, true, true);
            this.bola.setCollideWorldBounds(true);
            this.bola.setBounce(1);
            this.velocidad = 400;
            this.empezar();

        }
    }



    setupLocalPlayerControls(player) {
        const upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        const downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        upKey.on('down', () => {
            player.body.setVelocityY(-300);
            this.socket.emit('player-moved', { x: player.x, y: player.y });
        });

        upKey.on('up', () => {
            player.body.setVelocityY(0);
            this.socket.emit('player-moved', { x: player.x, y: player.y });
        });

        downKey.on('down', () => {
            player.body.setVelocityY(300);
            this.socket.emit('player-moved', { x: player.x, y: player.y });
        });

        downKey.on('up', () => {
            player.body.setVelocityY(0);
            this.socket.emit('player-moved', { x: player.x, y: player.y });
        });
    }
    updateBallPosition(ballPosition) {
        if (this.bola) {
            this.bola.x = ballPosition.x;
            this.bola.y = ballPosition.y;
        }
    }
    point(){
            let flag = true;
        if (flag){
            this.socket.emit('anotar-punto', { player: this.localPlayer.player });
            flag = false
        }
    }



}

export default OnlineMultiplayerScene;