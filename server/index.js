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
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
const pool = require("./db");
const eventsFolder = "./socketEvents";
io.on("connection", (socket) => {
  fs.readdirSync(eventsFolder).forEach((file) =>{
    const event = require(`${eventsFolder}/${file}`);
    // const eventName = file.split(".")[0];
    event(io, socket, pool);
  });
    console.log(`The ${socket.id} connected!`);
});
io.sockets.on("connection", (socket) =>{
    socket.on("disconnect", (data) =>{
        // HANDLE USER LOGOUT FUNCTION --- TODO IMPORTANT ---
        console.log(`Dissconnected: ${socket, ' || ', socket.userId}`);
        // const logoutEvent = require(`${eventsFolder}/user_logout`);
        // logoutEvent(io, socket, pool);
    });
});
io.on("disconnect", (socket) =>{
    console.log(`Socket ${socket} disconnected! `);
})
server.listen(3001, () => {
    console.log("Server is on!")
})




// use socket io for isTyping function TODO \\\\\\\\\\\\\\\\\\