const socket = io()


socket.on('message', (message) => {
  console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const message = e.target.elements.message.value
  socket.emit('sendMessage', message)
})

document.querySelector('#send-location').addEventListener('click', (position) => {
  console.log(position)
  
})

// socket.on('countUpdate', (count) => {
//   console.log('The count has been updated!', count)
// })


// //Sending data from user to server
// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked!')
//   socket.emit('increment')
// })