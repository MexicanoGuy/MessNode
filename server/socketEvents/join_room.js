module.exports = (io, socket, pool) =>{
    
    socket.on("join_room", (data) =>{
        if(data !== null){
            var room = data;
            socket.join(room);
            socket.userId = room;
            console.log(`User: ${socket.id}, joined a room ${room}`);
        }
    });
}