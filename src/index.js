const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

// let count = 0


io.on('connection', (socket) => {
  console.log('New Websocket connection')
  
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room })
    
    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('Welcome!') )
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`)) //Send to everyone except current socket

    callback()

    // Sending event from server to client
    //socket.emit -> sending event to specific client
    // io.emit -> sending event to everyone
    // socket.broadcast.emit -> sending event to everyone except the current one
    //io.to.emit -> sending event to everyone in a specific room
    // socket.broadcast.to.emit -> sending event to everyone except the current one in a specific room
  })


  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }
    io.emit('message', generateMessage(message))
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
    }
  })

  // socket.emit('countUpdate', count)
  // socket.on('increment', () => {
  //   count++
  //   // socket.emit('countUpdate', count) //Emit only in one window
  //   io.emit('countUpdate', count)  //Emit to every single connection
  // })
})


server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})

//Server (emit) -> client (receive) - countUpdate
//client (emit) -> server (receive) - increment

