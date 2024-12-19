const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const port = 9000;
const db = require("./db")
const util = require('util');
const io = socketio(server, {
  cors: {
    origin: "*", // Cho phép tất cả các nguồn (hoặc thay thế bằng URL frontend cụ thể)
    methods: ["GET", "POST"]
  }
});



app.get("/chat/:user_id", (req,res)=>{
  user_id = req.params['user_id']
  db.query(
    `SELECT session_message.id as message_id , session_message.message, user.username as user_name_sent, session_message.sent_at FROM session_message, user WHERE user_id = ? and user.id = session_message.user_sent`,
    [user_id],
    (error, results) => {
      if (error) {
        console.error('Lỗi khi truy vấn:', error);
        return;
      }
      console.log("res day: ", results)
      res.send(results)
    }
  );
}) 

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('send_mess', ({ hash, message }) => {
      const query = util.promisify(db.query).bind(db);
      (async () => {
        let session_exit_1 = 0;
        let session_exit_2 = 0;
      
        try {
          // Thực hiện chèn tin nhắn vào bảng private_message
          const sqlInsertMessage = `
            INSERT INTO private_message (content, sent_at, receiver_id, sender_id)
            VALUES (?, ?, ?, ?)
          `;
          const values = [
            message.content,
            message.sent_at,
            message.receiver_id,
            message.sender_id,
          ];
          await query(sqlInsertMessage, values);
          const sessionQuery1 = `
            SELECT * FROM session_message WHERE user_id = ? AND user2_id = ?
          `;
          const results1 = await query(sessionQuery1, [message.sender_id, message.receiver_id]);
          session_exit_1 = results1.length > 0 ? 1 : 0;
      
          // Kiểm tra session_message với receiver_id và sender_id
          const sessionQuery2 = `
            SELECT * FROM session_message WHERE user_id = ? AND user2_id = ?
          `;
          const results2 = await query(sessionQuery2, [message.receiver_id, message.sender_id]);
          session_exit_2 = results2.length > 0 ? 1 : 0;
      
          console.log("test: " + session_exit_1, session_exit_2);
      
          // Xử lý logic if-else
          if (session_exit_1 === 0 && session_exit_2 === 0) {
            const sqlInsertSession = `
              INSERT INTO session_message (user_id, message, user2_id, sent_at, user_sent)
              VALUES (?, ?, ?, ?, ?)
            `;
            const values1 = [
              message.sender_id,
              message.content,
              message.receiver_id,
              message.sent_at,
              message.sender_id,
            ];
            const values2 = [
              message.receiver_id,
              message.content,
              message.sender_id,
              message.sent_at,
              message.sender_id,
            ];
            await query(sqlInsertSession, values1);
            await query(sqlInsertSession, values2);
          } else if (session_exit_1 === 1 && session_exit_2 === 1) {
            const sqlUpdateSession = `
              UPDATE session_message
              SET message = ?, sent_at = ?, user_sent = ?
              WHERE user_id = ? AND user2_id = ?
            `;
            const updateValues1 = [
              message.content,
              message.sent_at,
              message.sender_id,
              message.sender_id,
              message.receiver_id,
            ];
            const updateValues2 = [
              message.content,
              message.sent_at,
              message.sender_id,
              message.receiver_id,
              message.sender_id,
            ];
            await query(sqlUpdateSession, updateValues1);
            await query(sqlUpdateSession, updateValues2);
          }
      
          console.log(`Message:`, message);
          io.emit(`send_${hash}`, message.content);
        } catch (err) {
          console.error('Error:', err);
        }
      })();

    });



    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is listening at the port: ${port}`);
});
