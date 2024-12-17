
    let socket = io('localhost:9000');

    let form = document.getElementById('form');
    let myname = document.getElementById('myname');
    let message = document.getElementById('message');
    let messageArea = document.getElementById("messageArea");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (message.value) {
            socket.emit('send_name', myname.value);
            socket.emit('send_message', message.value);
            console.log("init " + message.value);
            message.value = "";
        }
    });

    socket.on("send_name", (username) => {
        console.log(username);
        let name = document.createElement("p");
        name.style.backgroundColor = "grey";
        name.style.width = "100%";
        name.style.textAlign = "center";
        name.style.color = "white";
        name.textContent = username + ":";
        messageArea.appendChild(name);
    });

    socket.on("send_message", (chat) => {
        console.log(chat);
        let chatContent = document.createElement("p");
        chatContent.textContent = chat;
        messageArea.appendChild(chatContent);
    });