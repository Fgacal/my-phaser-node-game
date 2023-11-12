class JoinRoomScene extends Phaser.Scene {
    constructor() {
        super({ key: 'JoinRoomScene' });
        this.socket = io();
    }
    create() {

   
        // Emite el evento para obtener las salas activas
        this.socket.emit('get-active-rooms');

        this.audio = this.sound.add("inicio", { loop: true });
        this.a = this.sound.add("a");
        this.audio.play();
        let center_width = this.sys.game.config.width / 2;
        let center_height = this.sys.game.config.height / 2;
        let graphics = this.add.graphics();
        graphics.fillStyle(0xFAD7A0, 1)
        graphics.fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height)
        this.titleText = this.add.text(center_width, this.sys.game.config.height / 4, "Partidas", {
            color: "#85C1E9",
            fontFamily: "bunge",
            fontSize: 40
        }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);
        this.titleText.setOrigin(0.5);

        // Escucha la respuesta del servidor
        this.socket.on('active-rooms', (activeRooms) => {
            console.log('Salas activas:', activeRooms);
            if(activeRooms.length > 0){
                let count = 0;
                activeRooms.forEach((room) => {
                    count += 25;
                    this.createMenuButton(center_height + count, `${room.roomName} ${room.numPlayers}/2`, 'CreateRoomScene', room);
                });
            }
            else{
                this.createMenuButton(center_height , `No hay partidas en este momento ..`, false);
            }
        });
        this.socket.on('roomError',(error)=>{
            this.errorText = this.add.text(center_width, this.sys.game.config.height / 5, error, {
                color: "#FF5100",
                fontFamily: "console",
                fontSize: 30
            }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);
            setTimeout(() => {
                this.errorText.destroy()
            }, 3000);
        })
    }

    createMenuButton(y, text, sceneKey, roomInfo = null) {
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
                roomInfo.joinPlayer = true;
                this.scene.start('CreateRoomScene', roomInfo);  
            });
        }
    }
}

export default JoinRoomScene;
