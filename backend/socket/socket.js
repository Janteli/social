import {Server} from 'socket.io';
import express from 'express';
import http from 'http';

const app = express()

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin:process.env.URL,
        methods:['GET', 'POST']
    }
});

const userSocketMap = {}; //this map stores socket io corresponding the users userid -> socket id

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId]

io.on('connection', (socket)=>{
    const userId = socket.handshake.query.userId; //if userId user is logged in
    if(userId){
        userSocketMap[userId] = socket.id;
        console.log((`user connected: userId = ${userId}, SocketId = ${socket.id}`));
    };

    io.emit('getOnlneUsers', Object.keys(userSocketMap))
    // console.log(userSocketMap);
    
    socket.on('disconnect', ()=>{
        if(userId){
            delete userSocketMap[userId]
            console.log((`user disconnected: userId = ${userId}, SocketId = ${socket.id}`));
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    })
});

export {app, server, io}