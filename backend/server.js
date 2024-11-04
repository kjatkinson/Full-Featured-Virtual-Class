const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidV4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store room data
const rooms = {};

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(userId);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      rooms[roomId] = rooms[roomId].filter(id => id !== userId);
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
    });
  });

  // Real-time messaging
  socket.on('send-message', (roomId, message) => {
    io.to(roomId).emit('receive-message', message);
  });

  // File sharing
  socket.on('file-upload', (roomId, file) => {
    io.to(roomId).emit('file-shared', file);
  });
});

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
