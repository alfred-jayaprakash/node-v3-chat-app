const socket = io()

//Elements
const $messageForm = document.querySelector('#sendform')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('#send-message')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Templates
const notificationTemplate = document.querySelector('#notification-template').innerHTML
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        user: message.user,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('sendMessage', (message) => {
    console.log('Message received: ', message)
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (message) => {
    console.log('Location received: ', message)
    const html = Mustache.render(locationTemplate, {
        user: message.user,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        //Geolocation is not supported
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled') //Disable location button
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (message) => {
            $sendLocationButton.removeAttribute('disabled') //Re-enable location button
            console.log('Location shared!', message)
        })
    })
})

document.querySelector('#send-message').addEventListener('click', () => {
    const message = $messageFormInput.value

    $messageFormButton.setAttribute('disabled', 'disabled') //Disable submit button
    $messageFormInput.value = ''
    $messageFormInput.focus()

    console.log(message)
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')

        if (error) {
            return console.log(error) 
        }
        console.log('Message was delivered')
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})