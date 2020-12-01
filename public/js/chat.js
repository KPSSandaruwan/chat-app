const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options -> parsing the username and room
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  // New message elements
  const $newMessage = $messages.lastElementChild

  // Hight of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible Height
  const visibleHeight = $messages.offsetHeight

  // Hight of message container
  const containerHeight = $messages.scrollHeight

  // How far have I scrolled?
  const scrollOffSet = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffSet) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('message', (message) => {
  console.log(message)

  //Rendering messages
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (message) => {
  console.log(message)
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})


document.querySelector('#message-form').addEventListener('submit', (e) => {
  e.preventDefault()
  
  // Disable
  $messageFormButton.setAttribute('disabled', 'disabled')
  
  const message = e.target.elements.message.value
  
  socket.emit('sendMessage', message, (error) => {
    // Enable
    $messageFormButton.removeAttribute('disabled')
    // Clear the input
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if (error) {
      return console.log(error)
    }
    console.log('Message delivered!')
  })
})

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
  }

  $sendLocationButton.setAttribute('disabled', 'disabled')
  
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position)
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      $sendLocationButton.removeAttribute('disabled')
      console.log('Location shared!')
    })
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})


// socket.on('countUpdate', (count) => {
//   console.log('The count has been updated!', count)
// })


// //Sending data from user to server
// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked!')
//   socket.emit('increment')
// })