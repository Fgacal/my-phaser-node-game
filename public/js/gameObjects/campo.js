export default class campo extends Phaser.GameObjects.Sprite{
    constructor(scene,x,y,type){
        super(scene,x,y,type); //exportar constructo del  clase padre
        scene.add.existing(this); // agregar ecena
        scene.physics.world.enable(this);  // ACTIVAE fisicas en el mundo
        this.body.immovable=true;  //objetos inamovivle
        this.body.setCollideWorldBounds(true);
    }

}