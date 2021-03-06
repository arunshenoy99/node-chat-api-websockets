const socket = io()

//ELEMENTS

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton  = document.querySelector('#sendlocation')
const $messages = document.querySelector('#messages')

//TEMPLATES

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//OPTIONS
const {username,room}=Qs.parse(location.search.slice(1))

//AUTOSCROLLING FUCNTION

const autoScroll = ()=>{
    //GET NEW MESSAGE ELEMENT
    $newMessage = $messages.lastElementChild

    //HEIGHT OF NEW MESSAGE
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //VISIBLE HEIGHT
    const visibleHeight = $messages.offsetHeight

    //HEIGHT OF MESSAGES CONTAINER

    const contentHeight = $messages.scrollHeight

    //HOW FAR HAVE I SCROLLED

    const scrollOffset = $messages.scrollTop+visibleHeight

    if(contentHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

//HANDLE LOCATION MESSAGE EVENT

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('HH:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

//HANDLE MESSAGE EVENT

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('HH:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)                      //ADDS MESSGAES TO THE BOTTOM
    autoScroll()
})

//HANDLE A ROOMDATA EVENT

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,users
    })
    document.querySelector('#sidebar').innerHTML=html
})

//EMIT A SENDMESSAGE EVENT

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault('HH:')

    $messageFormButton.setAttribute('disabled','disabled')              //DISABLE BUTTON UNTIL EVENT FINISHED
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')                  //ENABLE BUTTON
        $messageFormInput.value=''                                      //CLEAR THE FIELD
        $messageFormInput.focus()                                       //REFOCUS FROM BUTTON TO FIELD
        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

//EMIT A SENDLOCATION EVENT

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')     
    navigator.geolocation.getCurrentPosition((position)=>{
        const coords = {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }
        socket.emit('sendLocation',coords,()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
   if(error){
       alert(error)
       location.href = '/'
   }
})