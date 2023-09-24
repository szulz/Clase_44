const express = require('express')
const socketServer = require('../app')
const chatRouter = express.Router()
const Auth = require('../middlewares/auth')
const auth = new Auth


chatRouter.get('/', auth.allowUsersInSession, auth.blockAdmin, async (req, res) => {
    let userName = req.session.user.email
    return res.render('chat', { userName })
})

const { Server } = require('socket.io');
function connectSocket(httpServer) {
    const socketServer = new Server(httpServer)
    const users = {}
    socketServer.on('connection', (socket) => {

        socket.on('new-user', userName => {
            users[socket.id] = userName
            socket.broadcast.emit('user-connected', userName)
        })
        socket.on('send-chat-message', message => {

            socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
        });

        socket.on('disconnect', () => {
            socket.broadcast.emit('user-disconnect', users[socket.id])
            delete users[socket.id]
        })
    });
}

module.exports = {
    chatRouter: chatRouter,
    connectSocket: connectSocket
}