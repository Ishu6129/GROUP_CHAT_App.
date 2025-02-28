const socket = io('http://localhost:5000');
const chatMessages = document.querySelector('#chat-messages');
const messageInput = document.querySelector('#message');
const sendButton = document.querySelector('#send');
const currentUser = document.querySelector('#current-username');
const usernameInput = document.querySelector('#username');
const updateButton = document.querySelector('#update-username');

let currentusername = "";

socket.on('set_username', data => {
    currentusername = data.username;
    currentUser.innerHTML = `Your name : ${currentusername}`;
});

socket.on('user_connected', data => {
    addMessage(`${data.username} has joined the chat`, 'system');
});

socket.on('disconnect', data => {
    addMessage(`${data.username} has left the chat`, 'system');
});

socket.on('new_message', data => {
    addMessage(data.message, 'user', data.username, data.avatar);
});

socket.on('username_updated', data => {
    addMessage(`${data.old_username} updated their name to ${data.new_username}`, 'system');
    if (data.old_username === currentusername) {
        currentusername = data.new_username;
        currentUser.textContent = `Your name is ${currentusername}`;
    }
});

sendButton.addEventListener('click', () => {
    sendMessage();
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

updateButton.addEventListener('click', () => {
    updateUsername();
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('send_message', { message });
        messageInput.value = '';
    }
}

function updateUsername() {
    const newUsername = usernameInput.value.trim();
    if (newUsername && newUsername !== currentusername) { 
        socket.emit('update_username', { username: newUsername });
        usernameInput.value = '';
    }
}

function addMessage(message, type, username = "", avatar = "") {
    const messageElement = document.createElement('div');
    messageElement.className = "message";

    if (type === "user") {
        const isSentMessage = username === currentusername;
        if (isSentMessage) {
            messageElement.classList.add('sent');
        }

        const avatarImg = document.createElement('img');
        avatarImg.src = avatar;
        avatarImg.className = "avatar";
        messageElement.appendChild(avatarImg);

        const contentDiv = document.createElement('div');
        contentDiv.className = "message-content";

        const userNameDiv = document.createElement('div');
        userNameDiv.className = "message-username";
        userNameDiv.textContent = username;
        contentDiv.appendChild(userNameDiv);

        const messageTextDiv = document.createElement('div');
        messageTextDiv.textContent = message;
        contentDiv.appendChild(messageTextDiv);

        messageElement.appendChild(contentDiv);
    } else {
        messageElement.textContent = message;
        messageElement.classList.add('system-message');
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
