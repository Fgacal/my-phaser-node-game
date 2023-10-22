class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop('PauseScene');
            this.scene.resume('PlayScene'); // Reanudar la escena de juego principal

        });
        // Crear un fondo oscuro para el menú de pausa
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

        // Crear el menú de pausa en el centro de la pantalla
        const menu = this.add.container(400, 300, [overlay]);

        // Agregar elementos de menú, como botones de reanudar y reiniciar
        const resumeButton = this.add.text(0, -50, 'Reanudar', { fontSize: '24px', fill: '#fff' });
        const restartButton = this.add.text(0, 50, 'Reiniciar', { fontSize: '24px', fill: '#fff' });

        // Agregar elementos de menú al contenedor
        menu.add([resumeButton, restartButton]);

        // Hacer que los elementos de menú sean interactivos
        resumeButton.setInteractive();
        restartButton.setInteractive();

        // Definir acciones cuando se hace clic en los botones del menú
        resumeButton.on('pointerdown', () => {
            this.scene.stop('PauseScene'); // Detener la escena de pausa
            this.scene.resume('PlayScene'); // Reanudar la escena de juego principal
        });

        restartButton.on('pointerdown', () => {
            this.scene.stop('PauseScene'); // Detener la escena de pausa
            this.scene.start('PlayScene'); // Reiniciar la escena de juego principal
        });
    }
}

export default PauseScene