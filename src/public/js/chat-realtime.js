const socket = io();

let userName = localStorage.getItem('userName')
socket.emit('new-user', userName)
socket.on('user-connected', data => {
    appendMessage(`${data} connected`)
})

socket.on('user-disconnected', data => {
    appendMessage(`${data} disconnected`)
})

const messageContainet = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')


socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`)
})

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', message)
    messageInput.value = ''
})

function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.innerHTML = message
    messageContainet.append(messageElement)
}