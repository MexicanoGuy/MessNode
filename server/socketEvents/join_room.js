module.exports = (io, socket, pool) =>{
    
    socket.on("join_room", (data) =>{
        socket.join(data.room);
        console.log(`User: ${socket.id}, joined a room ${data.room}`);
        pool.end;
    });
}