const express = require('express');
const app = express();
const http = require("http");
const {Server} = require('socket.io');
const fs = require('fs');
const cors = require("cors");
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://messnode.netlify.app:3000",
        methods: ["GET", "POST"],
    },
});
const pool = require("./db");
const eventsFolder = "./socketEvents";
let socketCustomUserId = {};

io.on("connection", (socket) => {
    fs.readdirSync(eventsFolder).forEach((file) =>{
        const event = require(`${eventsFolder}/${file}`);
        event(io, socket, pool);
    });
    socket.on("assign_socket_userId", (data) =>{
        if(!socketCustomUserId.hasOwnProperty(String(socket.id))){
            socketCustomUserId[String(socket.id)] = { userId: data};            
        }
    });
    console.log(`The ${socket.id} connected!`);
});

let reconnectTimeout;
let disconnected = {};
io.sockets.on("connection", (socket) =>{
    socket.on("disconnect", () =>{
        if(!disconnected[socket.id]){
            reconnectTimeout = setTimeout(() =>{
                if(socketCustomUserId.hasOwnProperty(socket.id) && socketCustomUserId[socket.id].userId){
                    var socketUserId = socketCustomUserId[socket.id].userId;
                    const event = require(`${eventsFolder}/user_logout`);
                    event(io, socket, pool, socketUserId);
                }
//                 delete socketCustomUserId[socket.id];
                disconnected[socket.id] = true;
            }, 5000);
        }        
    });
    socket.on("connect", () =>{
        if(!disconnected[socket.id]){
            clearTimeout(reconnectTimeout);
        }
        disconnected[socket.id] = false;
    });
});

io.on("disconnect", (socket) =>{
    console.log(`Socket ${socket} disconnected!`);
});
app.get("/", (req, res) =>{
    res.send("Hello to the backend server!");
});
app.get('/favicon.ico', (req, res) => res.status(204));
server.listen(3001, () =>{
    console.log(`Server ${server.address().port} is on!`);
});
