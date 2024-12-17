
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const port = 9000;
const socketio = require('socket.io');
const io = socketio(server, {
  cors: {
    origin: "*",  // Cho phép tất cả các nguồn (hoặc thay thế bằng URL frontend cụ thể, ví dụ: "http://localhost:3000")
    methods: ["GET", "POST"]
  }
});


// Socket.io connection events
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('send_name', (username) => {
        console.log(username);
        io.emit('send name', username);
    });

    socket.on('send_message', (chat) => {
      console.log(chat);
      io.emit('send message', chat);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is listening at the port: ${port}`);
});
