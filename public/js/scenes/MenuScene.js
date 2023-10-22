class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    create() {
        this.audio = this.sound.add("inicio", { loop: true });
        this.a = this.sound.add("a");
        this.audio.play();
        let center_width = this.sys.game.config.width / 2;
        let center_height = this.sys.game.config.height / 2;
        let graphics = this.add.graphics();
        graphics.fillStyle(0xFAD7A0, 1)
        graphics.fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height)
        this.titleText = this.add.text(center_width, this.sys.game.config.height / 4, "PONG", {
            color: "#E74C3C",
            fontFamily: "bunge",
            fontSize: 80
        }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);
        this.titleText.setOrigin(0.5);
        const transtion = () => {
            let tween = this.tweens.add({
                targets: this.titleText,

                props: {

                    x: {
                        delay: 1006,
                        value: 200,
                        duration: 500
                    },
                },
                repeat: 1,
                yoyo: true,
                ease: 'Sine.easeInOut',

            })

            tween.setCallback('onComplete', () => {
                this.tweens.add({
                    targets: this.titleText,
                    props: {
                        x: {
                            delay: 1006,
                            value: 600,
                            duration: 500
                        },
                    },
                    repeat: 1,
                    yoyo: true,
                    ease: 'Sine.easeInOut',
                });
            }, [], this);
        }
        transtion();
        setInterval(() => {
            transtion();
        }, 13000);
        // Agrega botones para diferentes opciones
        this.createMenuButton(center_height, 'Jugar', 'PlayScene');
        this.createMenuButton(center_height + 40, 'Multijugador Local', 'PlayScene');
        this.createMenuButton(center_height + 80, 'Multijugador en Línea', 'OnlineMultiplayerScene');
    }

    createMenuButton(y, text, sceneKey) {
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
            button.setColor('#E74C3C');
        });

        // Restaura el color original cuando el puntero sale del botón
        button.on('pointerout', () => {
            button.setColor('#fff');
        });

        // Inicia la escena correspondiente al hacer clic en el botón
        button.on('pointerdown', () => {
            const params = {
                localMultiplayer: (text == 'Multijugador Local') ? true : false
            }
            this.audio.stop();
            this.scene.start(sceneKey, params);
        });
    }
}

export default MenuScene;
