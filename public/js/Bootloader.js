class Bootloader extends Phaser.Scene {
    constructor() {
        super({ key: "Bootloader" });
    }
    preload() {
        /*       this.load.on("complete", () => { //CUANDO SE HAYA CARGADO
                  this.scene.start("inicio");

              }); */
        this.load.spritesheet('bolaa', './assets/animpelota.png', { frameWidth: 56, frameHeight: 56 },)
        this.load.audio("punto", "./assets/preview.mp3");
        this.load.audio("a", "./assets/golpe.mp3");
        this.load.audio("inicio", "./assets/pintball.mp3");
        this.load.image("bola", "./assets/PELOTA1.png");
        this.load.image("izquierda", "./assets/ROJO.png");
        this.load.image("derecha", "./assets/AZUL.png");
        this.load.image("campo1", "./assets/1c.png");
        this.load.image("campo2", "./assets/2c.png");
        this.load.image("campo3", "./assets/3c.png");
        this.load.image("p1", "./assets/p1.png");
        this.load.image("p2", "./assets/p2.png");
        this.load.image("p3", "./assets/p3.png");
        this.load.image("p4", "./assets/p4.png");
        this.load.image("p5", "./assets/p5.png");
        this.load.image("p6", "./assets/p6.png");





        this.graphics = this.add.graphics();
        this.newGraphics = this.add.graphics();
        var progressBar = new Phaser.Geom.Rectangle(200, 200, 400, 50);
        var progressBarFill = new Phaser.Geom.Rectangle(205, 205, 290, 40);

        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRectShape(progressBar);

        this.newGraphics.fillStyle(0x3587e2, 1);
        this.newGraphics.fillRectShape(progressBarFill);

        var loadingText = this.add.text(250, 260, "Loading: ", { fontSize: '32px', fill: '#FFF' });


        this.load.on('progress', this.updateBar, { newGraphics: this.newGraphics, loadingText: loadingText });
        this.load.on('complete', this.complete, { scene: this.scene });
    }

    updateBar(percentage) {

        this.newGraphics.clear();
        this.newGraphics.fillStyle(0x3587e2, 1);
        this.newGraphics.fillRectShape(new Phaser.Geom.Rectangle(205, 205, percentage * 390, 40));

        percentage = percentage * 100;
        this.loadingText.setText("Loading: " + percentage.toFixed(2) + "%");
    }

    complete() {
        this.scene.start("IndexScene");
    }

}

export default Bootloader;