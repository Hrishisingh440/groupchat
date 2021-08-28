const express =require('express')
const {generateMessage,generateLocationMessage}=require('./utils/message')
const {addUser,removeUser,getUser,getUserInRoom}=require('./utils/users')
const http=require('http')
const Filter= require('bad-words')
const socketio=require('socket.io')
const app=express()
const path= require('path')

const pdf=path.join(__dirname,'../public')
app.use(express.static(pdf))
const port=process.env.PORT||3000
const server=http.createServer(app)
const io=socketio(server)

io.on('connection',(socket)=>{
    console.log('New Connection')
    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        console.log(user.room)
        if (error){
           return callback(error)
        }


        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback()
    })
    
    socket.on('Sendmessage',(message,callback)=>{
        const user=getUser(socket.id)
        console.log(user)
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        
        callback()

    })
    socket.on('sendlocation',(coords,callback)=>{
        const user=getUser(socket.id)
        console.log(user)
        io.to(user.room).emit('locationmessage',generateLocationMessage(user.username,`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))
        
        callback()
    })
    socket.on('disconnect',()=>{
        const user= removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
        })

})
server.listen(port,()=>{
    console.log(`server is running on ${port}!`)
})