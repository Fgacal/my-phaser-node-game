const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// Configuración del servidor Express
const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0'; // Escucha en todas las interfaces de red

// Configuración del servidor HTTP
const server = http.createServer(app);
const io = new Server(server);

const players = {};

// Define una ruta estática para servir archivos estáticos (como el juego Phaser)
app.use(express.static(path.join(__dirname, 'public')));

// Define una ruta estática adicional para servir archivos desde "node_modules"
app.use('/phaser', express.static(path.join(__dirname, 'node_modules', 'phaser', 'dist')));

// Ruta principal que sirve tu juego (ajusta la ruta y el nombre de archivo según tu proyecto)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    let playerId = socket.handshake.query.playerId;

    if (!playerId) {
        playerId = uuidv4();
        // Almacena el ID del jugador en el almacenamiento local del navegador
        socket.emit('set-player-id', playerId);
    }

    console.log(`Nuevo jugador conectado con ID: ${playerId}`);

    if (!players[playerId]) {
        // Crea un nuevo jugador solo si no existe uno con el mismo ID
        const player = {
            id: playerId,
            x: 0,
            y: 0,
        };

        players[playerId] = player;

        // Emite solo a este jugador su ID
        socket.emit('set-player-id', playerId);

        // Emite a todos los jugadores conectados la información del nuevo jugador
        io.emit('player-connected', [player]);
    } else {
        // Si el jugador ya existe, simplemente actualiza su posición
        socket.emit('set-player-id', playerId);
        io.emit('player-connected', [players[playerId]]);
    }

    socket.on('player-move', (data) => {
        players[playerId].x = data.x;
        players[playerId].y = data.y;

        io.emit('player-moved', players[playerId]);
    });

    socket.on('disconnect', () => {
        delete players[playerId];
        io.emit('player-disconnected', playerId);
    });

    // Envía las posiciones iniciales y colores de todos los jugadores al nuevo jugador
    socket.emit('initial-positions', Object.values(players));
});

// Inicia el servidor Express
server.listen(port, host, () => {
    console.log(`Servidor Node.js en ejecución en http://${host}:${port}`);
});
