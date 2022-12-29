module.exports = (io, socket, pool) =>{

    socket.on("leave_room", (data) =>{
        console.log(`User: ${socket.id}, left a room ${data.room}`); 
    });
}