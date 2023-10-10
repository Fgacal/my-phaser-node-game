export default class PlayerGameObject extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, id) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.world.enable(this);
    this.setCollideWorldBounds(true); // Evita que el jugador salga del mundo
    this.isJumping = false;
    this.jumpVelocity = -400; // Velocidad de salto
    this.body.setSize(48, 48); // Tamaño del hitbox del jugador
    this.name = id;

    scene.anims.create({
      key: 'nombreDeLaAnimacion',
      frames: scene.anims.generateFrameNumbers(texture, {
        start: 1,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  update() {
    const { left, right, space } = this.scene.input.keyboard.keys;

    // Lógica de movimiento horizontal
    if (left.isDown) {
      this.body.setVelocityX(-200); // Mueve a la izquierda
      console.log('se mueve')
      // Reproduce la animación
      this.anims.play('nombreDeLaAnimacion');
    } else if (right.isDown) {
      this.body.setVelocityX(200); // Mueve a la derecha
    } else {
      this.body.setVelocityX(0); // Detiene el movimiento horizontal
    }

    // Lógica de salto
    if (Phaser.Input.Keyboard.JustDown(space) && !this.isJumping) {
      this.jump();
    }

    // Lógica adicional (puedes agregar más aquí)
  }

  jump() {
    this.body.setVelocityY(this.jumpVelocity);
    this.isJumping = true;
  }

  move(x, y) {
    this.x = x;
    this.y = y;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  // Puedes agregar más métodos y lógica aquí
}
