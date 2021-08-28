const socket=io()
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')
const $locationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#locations-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll=()=>{
    const $newMessage=$messages.lastElementChild
    const newMessageStyle=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

    const visibleHeight=$messages.offsetHeight
    const containerHeight=$messages.scrollHeight

    const scrollOffset= $messages.scrollTop +visibleHeight
    if(containerHeight-newMessageHeight <=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}
socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')

    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('locationmessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
     autoscroll()
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message=e.target.elements.message.value
    socket.emit('Sendmessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }console.log('delivered successfully')
    })
})
$locationButton.addEventListener('click',()=>
{
    if(!navigator.geolocation){
        return alert('geolocation is not supported by your browser')
    }
    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendlocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $locationButton.removeAttribute('disabled')

            console.log('location shared')
        })
    })

})
socket.emit('join',{username,room},(error)=>{
    if(error) {
        alert(error)
        location.href='/'
    }
})
socket.on('roomData',({room,users})=>{
const html=Mustache.render(sidebarTemplate,{
    room,
    users
})
document.querySelector('#sidebar').innerHTML=html
})