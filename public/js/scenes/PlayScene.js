import palas from '../gameObjects/palas.js';
import campo from '../gameObjects/campo.js'

class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: "PlayScene" })

    }

    init(data) {
        this.multiplayer = data.localMultiplayer;
    }

    create() {
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.launch('PauseScene'); // Lanzar la escena de pausa
            this.scene.pause(); // Pausar la escena de juego principal
        });

        this.audio = this.sound.add("a");
        this.punto = this.sound.add("punto");

        let center_width = this.sys.game.config.width / 2;
        let center_height = this.sys.game.config.height / 2;
        //separador
        this.add.image(center_width, center_height, "campo1")
        //this.separador=this.physics.add.image(center_height,center_height, "separador")
        // this.campo= new campo(this,center_width,center_height,"campo2");


        this.p1 = this.physics.add.staticImage(50, 35, "p1").setScale(1.3);
        this.p2 = this.physics.add.staticImage(399, 7, "p2").setScale(1.3);
        this.p3 = this.physics.add.staticImage(751, 36, "p3").setScale(1.3);
        this.p4 = this.physics.add.staticImage(50, 364, "p4").setScale(1.3);
        this.p5 = this.physics.add.staticImage(399, 393, "p5").setScale(1.3);
        this.p6 = this.physics.add.staticImage(751, 364, "p6").setScale(1.3);

        this.add.image(center_width, center_height, "campo3")

        //palas
        this.izquierda = new palas(this, 130, center_height, "izquierda").setScale(0.7);

        // this.izquierda =this.add.image(30,center_height,"izquierda");
        //this.derecha =this.add.image(this.sys.game.config.width-30,center_height,"derecha");
        this.derecha = new palas(this, this.sys.game.config.width - 130, center_height, "derecha").setScale(0.7); //instanciar un objeto de la clase palas
        //bola
        this.bola = this.physics.add.sprite(center_width, center_height, "bolaa").setScale(0.5); //pintar bola
        this.anims.create({
            key: "pelota",
            frames: this.anims.generateFrameNumbers('bolaa', {
                frames: [0, 1]
            }),
            repeat: 0,
            frameRate: 3

        });

        this.physics.world.setBoundsCollision(false, false, true, true);

        this.bola.setCollideWorldBounds(true); //que cuando choque rebote
        this.bola.setBounce(1); //que choque a la misma intencidad  de rebote
        this.velocidad = 500;
        this.empezar()



        //fisicas
        //colicion con palas
        this.physics.add.collider(this.bola, this.top);
        this.physics.add.collider(this.bola, this.bot);
        this.physics.add.collider(this.bola, this.p1, this.chocapared, null, this);
        this.physics.add.collider(this.bola, this.p2, this.chocapared, null, this);
        this.physics.add.collider(this.bola, this.p3, this.chocapared, null, this);
        this.physics.add.collider(this.bola, this.p4, this.chocapared, null, this);
        this.physics.add.collider(this.bola, this.p5, this.chocapared, null, this);
        this.physics.add.collider(this.bola, this.p6, this.chocapared, null, this);


        this.physics.add.collider(this.bola, this.derecha, this.chocapala, null, this);
        this.physics.add.collider(this.bola, this.izquierda, this.chocapala, null, this);


        //controles
        //pala derecha
        this.cursor = this.input.keyboard.createCursorKeys();
        // pala izquierda
        if (this.multiplayer) {
            this.cursor_W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.cursor_S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        }

        this.pintarMarcador();


    }


    empezar() {
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
        this.marcador1 = this.add.text(350, 75, '0', { fontFamily: 'Arial', fontSize: 80, color: '#f00', align: 'right' }).setOrigin(1, 0).setShadow(2, 2, 'rgba(0,0,0,1)', 0);;
        this.marcador2 = this.add.text(450, 75, '0', { fontFamily: 'Arial', fontSize: 80, color: '#3498DB', }).setShadow(2, 2, 'rgba(0,0,0,1)', 0);
        this.marcador1.visible = false;
        this.marcador2.visible = false;

    }



    update(time, delta) {

        if (this.multiplayer === false) {
            let tweenBot = this.tweens.add({
                targets: this.izquierda,
                props: {
                    y: {
                        value: this.bola.y,
                        duration: 1800

                    }
                },
                repeat: -1,
                ease: 'power3' // 'Elastic',
            });
        }

        this.bola.rotation += 0.1;
        this.physics.world.collide(this.izquierda, [this.p1, this.p2, this.p3, this.p4, this.p5], this.choca, null, this);
        this.physics.world.collide(this.derecha, [this.p1, this.p2, this.p3, this.p4, this.p5], this.choca, null, this);

        if (this.bola.x < 0) {
            this.velocidad += 8;
            console.log(this.velocidad)
            this.punto.play();
            this.bola.setPosition(400, 200);
            this.empezar();

            this.marcador1.visible = true;
            this.marcador2.visible = true;
            setTimeout(() => {
                this.marcador1.visible = false;
                this.marcador2.visible = false;
            }, 3500);

            this.marcador2.text = parseInt(this.marcador2.text) + 1;
        } else if (this.bola.x > this.sys.game.config.width) {
            this.velocidad += 8;
            console.log(this.velocidad)
            this.punto.play();
            this.bola.setPosition(400, 200);
            this.empezar()

            this.marcador1.visible = true;
            this.marcador2.visible = true;
            setTimeout(() => {
                this.marcador1.visible = false;
                this.marcador2.visible = false;
            }, 3600);

            this.marcador1.text = parseInt(this.marcador1.text) + 1;

        }

        //conteol de las palas 
        //pala derecha
        if (this.cursor.down.isDown) {
            this.derecha.body.setVelocityY(300);

        } else if (this.cursor.up.isDown) {
            this.derecha.body.setVelocityY(-300);

        } else {
            this.derecha.body.setVelocityY(0);
        }
        //pala izquierda
        if (this.multiplayer) {
            if (this.cursor_S.isDown) {
                this.izquierda.body.setVelocityY(300);
            } else if (this.cursor_W.isDown) {
                this.izquierda.body.setVelocityY(-300);
            } else {
                this.izquierda.body.setVelocityY(0);
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


}

export default PlayScene;