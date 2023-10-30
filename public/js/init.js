import Bootloader from './Bootloader.js'
import PlayScene from './scenes/PlayScene.js'
import IndexScene from './scenes/IndexScene.js'
import MenuScene from './scenes/MenuScene.js'
import PauseScene from './scenes/PauseScene.js'
import OnlineMultiplayerScene from './scenes/OnlineMultiplayerScene.js'
import MenuOnlineScene from './scenes/MenuOnlineScene.js'
import JoinRoomScene from './scenes/JoinRoomScene.js'
/* import CreateRoomScene from './scenes/CreateRoomScene.js' */

const config = {
    type: Phaser.AUTO,
    width: 800, // 100% del ancho de la ventana
    height: 400, // 100% del alto de la ventana
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    parent: "container",
    physics: {
        default: "arcade",
        arcade: {
            debug: true,

        }

    },

    scene: [
        Bootloader,
        PlayScene,
        IndexScene,
        MenuScene,
        PauseScene,
        OnlineMultiplayerScene,
        MenuOnlineScene,
        JoinRoomScene,
  /*       CreateRoomScene */
    ],
    fps: 60
}
new Phaser.Game(config);
