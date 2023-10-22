class IndexScene extends Phaser.Scene {
    constructor() {
        super({ key: "IndexScene", })

    }
    create() {
        let center_width = this.sys.game.config.width / 2;
        let center_height = this.sys.game.config.height / 2;
        let graphics = this.add.graphics();
        console.log(this.sys.game.config)
        graphics.fillStyle(0xFAD7A0, 1)
        graphics.fillRect(0, 0, this.sys.game.config.width, 400)
        this.titulo = this.add.text(center_width - 150, center_height - 100, "PONG", { color: "#E74C3C", fontFamily: "bunge", fontSize: 100 }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);
        this.texto = this.add.text(center_width - 90, center_height + 100, "press Enter", { color: "#fff", fontFamily: "bunge", fontSize: 20 }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);
        this.texto.alpha = 0;
        let tween = this.tweens.add({
            targets: this.titulo,

            props: {

                x: {
                    delay: 1006,
                    value: 300,
                    duration: 700
                },
                y: {

                    value: 0,
                    duration: 700
                }
            },
            repeat: 2,
            yoyo: true,
            ease: 'power3',


        });
        let tween1 = this.tweens.add({
            targets: this.texto,
            duration: 900,
            alpha: 1,
            repeat: -1,
            yoyo: true,
            ease: 'none',
            onStart: () => {
            },
        });




        console.log(Phaser.Input.Keyboard);
        this.input.keyboard.on("keyup-ENTER", () => { //escucha de tecla
            this.scene.start("MenuScene");
        });
    }
}


export default IndexScene;