const express=require("express");
const path=require("path");
const { env } = require("process");
const http=require("http");
const socketio=require("socket.io");
const formatMessage=require("./utils/message");
const {userJoin,getCurrentUser,
    userLeave, getRoomUsers}= require('./utils/users');

const app=express();
const server=http.createServer(app);
const io=socketio(server);

const staticPath=path.join(__dirname,"./public");
app.use(express.static(staticPath));


io.on("connection",socket=>{
    socket.on("joinRoom",({username,room})=>{
        const user=userJoin(socket.id,username,room);
        socket.join(user.room);

        console.log("New connection  established");

        socket.emit("botMsg","Welcome to our Chat App!");

        socket.broadcast.to(user.room).emit(
            "botMsg",`${user.username} joined the chat`
        );

        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
        });

    });

socket.on("send",msg=>{
    const user=getCurrentUser(socket.id);

    socket.broadcast.to(user.room).emit('message',formatMessage(user.username,msg));
    socket.emit("messageSelf",formatMessage(user.username,msg));
});



socket.on("disconnect",()=>{
    const user=userLeave(socket.id);
    if(user){
        io.to(user.room).emit(
            "botMsg",`${user.username} has left the chat`
        )

        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    };
})


socket.on("typing",data=>{
    const user=getCurrentUser(socket.id);

    socket.broadcast.to(user.room).emit("typing",`Status: ${user.username} is typing...`);
});


socket.on("untyping",data=>{
    const user=getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit("untyping","Status: Null")
});
   
});







const PORT=process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log(`server listening on the port ${PORT}`)
})