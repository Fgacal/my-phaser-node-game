const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const express = require('express');
const { emit } = require('process');
const { Console } = require('console');
const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

const server = http.createServer(app);
const io = new Server(server);

// Ruta principal para servir el juego (ajusta la ruta y el nombre de archivo según tu proyecto)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Define una ruta estática adicional para servir archivos desde "node_modules"
app.use('/phaser', express.static(path.join(__dirname, 'node_modules', 'phaser', 'dist')));

// Almacena las posiciones de los jugadores
const disconnectedPlayers = {};
const playerInfo = {}; // Almacena la información del jugador, incluyendo posición, color y sala
const maxPlayersPerRoom = 2; // Limita a 2 jugadores por sala
const emptyRooms = [];
const activeRooms = [];


let ballPosition = { x: 400, y: 200 }; // Agrega una variable para rastrear la posición de la bola

io.on('connection', (socket) => {


    socket.on('get-active-rooms', () => {
        const activeRooms = getAvailableRoomsInfo();
        socket.emit('active-rooms', activeRooms);
    });

    let roomId = null;

    const leaveRoom = (roomId) => {
        if (roomId) {
            console.log('leaveroom')
            socket.leave(roomId);

            // Obtiene la lista de jugadores en la sala
            const playersInRoom = getPlayersInRoom(roomId);

            // Elimina al jugador de la información de la sala
            delete playerInfo[socket.id];

            if (playersInRoom.length === 0) {
                // Si la sala está vacía, elimina la sala y quítala de la lista de salas vacías
                const index = emptyRooms.indexOf(roomId);
                if (index !== -1) {
                    emptyRooms.splice(index, 1);
                }
                io.sockets.adapter.rooms.delete(roomId);
            }
        }
    };
    /* socket.on('player-joined', () => {
        leaveRoom();
        const availableRoom = getAvailableRoom();
        console.log(availableRoom +' romm availabkle');

        if (availableRoom) {
            roomId = availableRoom;
            const roomIndex = emptyRooms.indexOf(roomId);
            if (roomIndex !== -1) {
                emptyRooms.splice(roomIndex, 1);
            }
        } else {
            roomId = 'Sala--' + uuidv4();
            console.log(roomId)
            emptyRooms.push(roomId);
            console.log('Creada sala: ' + roomId);
        }
        console.log('el jugador con socket ' + socket.id + 'Uniéndose a la sala: ' + roomId);
        socket.join(roomId);


        const playerId = socket.id;

        if (disconnectedPlayers[playerId] && false) {
            // Jugador reconectado
            playerInfo[socket.id] = disconnectedPlayers[playerId];
            playerInfo[socket.id].room = roomId; // Asegúrate de que el jugador reconectado esté en la sala correcta
            io.to(roomId).emit('player-info', playerInfo[socket.id]);
        } else {
            const playersInRoom = getPlayersInRoom(roomId);
            // Nuevo jugador
            if (playersInRoom.length === 1) {
                playerInfo[socket.id] = { id: playerId, color: 'blue', position: { x: 0, y: 0 }, room: roomId, player: 1, score: 0, isHost: true};
                io.to(roomId).emit('player-info', playerInfo[socket.id]);
            } else if (playersInRoom.length === 2) {
                playerInfo[socket.id] = { id: playerId, color: 'red', position: { x: 0, y: 0 }, room: roomId, player: 2, score: 0, };
                io.to(roomId).emit('player-info', playerInfo[socket.id]);

                let players = Object.values(playerInfo).map((player) => {
                    if (player.room == roomId) {
                        return player;
                    }
                });
                io.sockets.emit('all-players', players);
            }


            if (playersInRoom.length === maxPlayersPerRoom) {
                const allPlayerIds = playersInRoom.map(playerId => playerInfo[playerId]);
                io.to(roomId).emit('all-player-ids', allPlayerIds);
                io.to(roomId).emit('start-game', ballPosition); // Emite la posición inicial de la bola al comenzar el juego
            }
        }
    });
 */
    socket.on('create-room', () => {
        const playerId = socket.id;
        // Genera un identificador único para la sala (puedes usar la librería uuid)
        const roomId = 'Sala--' + uuidv4();
        console.log('creada sala ' + roomId)
        // Asocia al cliente actual (el que emitió el evento) a la nueva sala
        socket.join(roomId);

        let playerHost = createPlayerServer(true, roomId, playerId);
        console.log(playerHost)
        /*      let players = Object.values(playerInfo).map((player) => {
                 if (player.room == roomId) {
                     return player;
                 }
             });
             io.sockets.emit('all-players', players); */
        // Puedes realizar cualquier otra lógica que necesites, como almacenar información de la sala, etc.
        // Emite un evento para notificar al cliente que la sala se ha creado con éxito y proporciona el ID de la sala
        socket.emit('room-created', playerHost);
    });
    socket.on('player-joined', (romInfo) => {
        console.log(romInfo.roomName)
        const playersInRoom = getPlayersInRoom(romInfo.roomName);
        if (playersInRoom.length < 2) {
            socket.join(romInfo.roomName)
            createPlayerServer(false, romInfo.roomName, socket.id)
            let playersInRoom = Object.values(playerInfo).map((player) => {
                if (player.room == romInfo.roomName) {
                    return player;
                }
            })
            io.to(romInfo.roomName).emit('join-playerOnline', playersInRoom)
        } else {
            io.to(romInfo.roomName).emit('roomError', 'partida llena')
        }

    });

    // Resto de tu código sin cambios

    socket.on('disconnect', () => {

        if ((typeof playerInfo[socket.id] != 'undefined') && playerInfo[socket.id].room) {
            console.log('Jugador desconectado', playerInfo[socket.id].room);
            /*    leaveRoom(playerInfo[socket.id].room); */
            let roomId = playerInfo[socket.id].room
            io.to(roomId).emit('player-disconnected', playerInfo[socket.id]);
            if (playerInfo[socket.id].isHost == true) {
                console.log('hos desconectado')
                io.sockets.adapter.rooms.delete(roomId); // esto por ahora
                // Almacena la información del jugador desconectado
                disconnectedPlayers[socket.id] = playerInfo[socket.id];
                delete playerInfo[socket.id];
                const room = io.sockets.adapter.rooms.get(roomId);
                console.log(getPlayersInRoom(roomId), room)
                if (getPlayersInRoom(roomId).length === 0) {
                    const index = emptyRooms.indexOf(roomId);
                    if (index !== -1) {
                        emptyRooms.splice(index, 1);
                    }
                    io.sockets.adapter.rooms.delete(roomId);
                    console.log('Sala eliminada: ' + roomId);
                }
            }

        }
    });

    socket.on('player-moved', (position) => {
        if (playerInfo[socket.id]) {
            // Actualiza la posición del jugador en la información del jugador
            playerInfo[socket.id].position = position;
            io.to(roomId).emit('player-updated', {
                playerId: socket.id,
                position: playerInfo[socket.id].position
            });
        } else {
            console.error('Socket.id no encontrado en playerInfo:', socket.id);
        }
    });

    socket.on('ball-moved', (position) => {
        if (playerInfo[socket.id] && playerInfo[socket.id].isHost) {
            ballPosition = position; // Actualiza la posición de la bola en función de la información recibida
            /*  console.log(playerInfo[socket.id].color + ' x :' + position.x + 'y: ' + position.y) */

            socket.to(roomId).emit('ball-updated', ballPosition); // Emite la nueva posición de la bola a todos los jugadores
        } else {
            console.error('Socket.id no encontrado en playerInfo en ball moved:', socket.id);
        }
    });

    socket.on('anotar-punto', (data) => {
        if (roomId) {
            if (playerInfo[socket.id]) {
                if (playerInfo[socket.id].player == data.player) {
                    playerInfo[socket.id].score += 1;
                    console.log('anotar punto ' + playerInfo[socket.id].color)
                    io.to(roomId).emit('actualizar-marcador', playerInfo[socket.id]);
                }
            }
        }

    });


    socket.on('pressCheckbox', (player) => {
        if (playerInfo[socket.id]) {
            playerInfo[socket.id].ready = (player.checkboxBox.name == 'true') ? true : false
            playerInfo[socket.id]
            console.log(getPlayersInRoom(player.room))
            socket.to(player.room).emit('updateCheckboxAppearanceOnline', player)
        }
        let players = getAllPlayersInRoomObject(player.room);
        console.log(players)
        let playersReady = 0;
        players.forEach((player) => {
            if ((player?.ready) && player.ready == true) {
                playersReady += 1
            }
            else {
                playersReady = 0
            }
        })
        console.log(playersReady)
        if (playersReady === 2) {
            io.to(player.room).emit('activeStartGameButton', true);
        }
        else { io.to(player.room).emit('activeStartGameButton', false) }
    });

    socket.on('startGame', (hostPlayer) => {
        console.log()
        if (hostPlayer.isHost == true) {
            io.to(hostPlayer.room).emit('startGameScene', getAllPlayersInRoomObject(hostPlayer.room))
        }

    });

});

function getAvailableRoom() {
    const rooms = io.sockets.adapter.rooms;
    for (const room of rooms.keys()) {
        if (room.startsWith('Sala--') && rooms.get(room).size < maxPlayersPerRoom) {
            return room;
        }
    }
    return null;
}

function getPlayersInRoom(roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
        return Array.from(room);
    }
    return [];
}

function getAvailableRoomsInfo() {
    const rooms = io.sockets.adapter.rooms;
    const availableRooms = [];

    for (const [roomName, room] of rooms) {
        if (roomName.startsWith('Sala--') && room.size < maxPlayersPerRoom) {
            const roomInfo = {
                roomName: roomName,
                numPlayers: room.size
            };
            availableRooms.push(roomInfo);
        }
    }

    return availableRooms;
}

function createPlayerServer(isHost = null, roomId, playerId) {
    if (isHost) {
        playerInfo[playerId] = { id: playerId, color: 'blue', position: { x: 0, y: 0 }, room: roomId, player: 1, score: 0, isHost: true, ready: false }
        return playerInfo[playerId]
        /*  io.to(roomId).emit('player-info', playerInfo[socket.id]); */
    }
    playerInfo[playerId] = { id: playerId, color: 'red', position: { x: 0, y: 0 }, room: roomId, player: 2, score: 0, ready: false }
    return playerInfo[playerId]
    /*  io.to(roomId).emit('player-info', playerInfo[socket.id]); */

}
function getAllPlayersInRoomObject(roomId) {
    getPlayersInRoom(roomId)
    return players = Object.values(playerInfo).map((player) => {
        if (player.room == roomId) {
            return player;
        }
    });
}

server.listen(port, host, () => {
    console.log(`Servidor Node.js en ejecución en http://${host}:${port}`);
});
