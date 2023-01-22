module.exports = (io, socket, pool) =>{
    
    socket.on("join_room", (data) =>{
        var room = data.convId;
        socket.join(room);
        console.log(`User: ${socket.id}, joined a room ${room}`);
    });
}