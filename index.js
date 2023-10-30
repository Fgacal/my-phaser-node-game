const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const express = require('express');
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

    const leaveRoom = () => {
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
    socket.on('player-joined', () => {
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

    // Resto de tu código sin cambios

    socket.on('disconnect', () => {
        console.log('Jugador desconectado');
        leaveRoom();
        console.log(roomId)
        if (roomId) {
            io.sockets.adapter.rooms.delete(roomId); // esto por ahora
            io.to(roomId).emit('player-disconnected', playerInfo[socket.id]);
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

server.listen(port, host, () => {
    console.log(`Servidor Node.js en ejecución en http://${host}:${port}`);
});
