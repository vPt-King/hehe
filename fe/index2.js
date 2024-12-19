const user = '5adf8117-b4d4-4ac2-809f-2832d24bef97'
const user_2 = '5d15ad52-c6ba-439a-8a2e-7c0bbf683dce'
let socket = io('http://localhost:9000'); // Kết nối tới server

// Lắng nghe kênh động `send_${user}` từ server
socket.on(`send_${maHoa(user,user_2)}`, (mess) => {
    alert(`Tin nhắn từ server: ${mess}`);
});

// Thêm sự kiện gửi tin nhắn
document.getElementById('sendMessageButton').addEventListener('click', () => {
    const text = document.getElementById('message').value;
    let message = {
        "content": text,
        "sent_at": getCurrentTime(),
        "receiver_id": user,
        "sender_id": user_2
    }
    let hash = maHoa(user, user_2) // Lấy nội dung tin nhắn
    socket.emit('send_mess', { hash, message});
    console.log(`Đã gửi tin nhắn: ${message}`);
});
function maHoa(id1, id2) {
    const sortedIds = [id1, id2].sort();
    const combined = sortedIds.join('-');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = (hash * 31 + char) % 1e9; // Sử dụng modulo để giữ giá trị trong giới hạn
    }
    return hash;
}


function getCurrentTime()
{
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    const microseconds = milliseconds + '000'; // Mô phỏng microsecond (6 chữ số)

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}`;
}