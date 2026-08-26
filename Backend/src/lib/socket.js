import express from "express"
import http from "http"
import {Server} from "socket.io"

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL;

const io = new Server(server, {
    cors: {
        origin: allowedOrigin || true,
        credentials: true,
    },
});

function getReceiverSocketId(userId){
    return userSocketMap[String(userId)];
}

const userSocketMap ={};

io.on("connection" ,(socket) =>{
    const userId = socket.handshake.query.userId;
    
    if(userId)
    {
        userSocketMap[String(userId)] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect" , ()=>{
        if(userId) delete userSocketMap[String(userId)];
        io.emit("getOnlineUsers" , Object.keys(userSocketMap));
    })
})


export { app, server, io, getReceiverSocketId };
