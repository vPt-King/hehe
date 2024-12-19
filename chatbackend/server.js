const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const port = 9000;
const db = require("./db")
const io = socketio(server, {
  cors: {
    origin: "*", // Cho phép tất cả các nguồn (hoặc thay thế bằng URL frontend cụ thể)
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
    console.log('A user connected');
    

    socket.on('send_mess', ({ hash, message }) => {
      const sql = `
      INSERT INTO private_message (content, sent_at, receiver_id, sender_id)
      VALUES (?, ?, ?, ?)
      `;
      const values = [
        message.content,
        message.sent_at,
        message.receiver_id,
        message.sender_id,
      ];
      db.query(sql, values, (err, rows) => { 
            if (err) throw err; 
      }); 
      console.log(`Message:`, message);
      io.emit(`send_${hash}`, `Server nhận được tin nhắn: ${message.content}`);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is listening at the port: ${port}`);
});
