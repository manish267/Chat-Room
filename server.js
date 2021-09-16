const express=require('express');
const http=require('http');

const app=express();
const path=require('path')
const server=http.createServer(app);
const socketio=require('socket.io');
const formatMessage =require('./utils/messages')
const {userJoin,getCurrentUser,userLeave,getRoomUsers} =require('./utils/users');

const io=socketio(server);


// Set static folder
app.use(express.static(path.join(__dirname,'/public')));

let botName="ChatRoom Bot"
// Run when client connects
io.on('connection',socket=>{
    let user;
    socket.on('joinRoom',({username,room})=>{
         user=userJoin(socket.id,username,room);

        socket.join(user.room);
        
        console.log("NEW Websocket connection.... " + socket.id);
        // Welcome Current User
        socket.emit('message',formatMessage(botName,'Welcome to ChatRoom'))
        // BroadCast when a user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));
        // Send users and room info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })
    })


    
    socket.on('chatMessage',(msg)=>{
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
        
    })


    // Runs when client disconnect
    socket.on('disconnect',()=>{
        const user=userLeave(socket.id)

        if(user){

            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));


        }
         // Send users and room info
         io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })
        })
})

const PORT=process.env.PORT || 3000;

server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});