const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Configuración del servidor Express
const app = express();
const port = process.env.PORT || 3000;

// Configuración del servidor HTTP
const server = http.createServer(app);
const io = new Server(server);

// Define una ruta estática para servir archivos estáticos (como el juego Phaser)
app.use(express.static(path.join(__dirname, './public')));

// Ruta principal que sirve tu juego (ajusta la ruta y el nombre de archivo según tu proyecto)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '../index.html'));
});

// Inicia el servidor Express
server.listen(port, () => {
    console.log(`Servidor Node.js en ejecución en http://localhost:${port}`);
});
