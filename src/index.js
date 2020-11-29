const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

// let count = 0


io.on('connection', (socket) => {
  console.log('New Websocket connection')
  
  socket.emit('message', 'Welcome!')
  socket.broadcast.emit('message', 'A new user has joined!') //Send to everyone except current socket

  socket.on('sendMessage', (message) => {
    io.emit('message', message)
  })

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left!')
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