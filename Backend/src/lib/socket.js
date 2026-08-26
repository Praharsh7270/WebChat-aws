import express from "express"
import http from "http"
import {Server} from "socket.io"

let app = express();
let server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL;

let io = new Server(server, {
    cors: {
        origin: allowedOrigin || true,
        credentials: true,
    },
});

let userSocketMap = {};

function getReceiverSocketId(userId){
    return userSocketMap[String(userId)];
}

function setSocketServer(newApp, newServer, newIo, newUserSocketMap) {
    if (newApp) app = newApp;
    if (newServer) server = newServer;
    if (newIo) io = newIo;
    if (newUserSocketMap) userSocketMap = newUserSocketMap;
}

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


export { app, server, io, getReceiverSocketId, setSocketServer };
