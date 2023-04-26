module.exports = (io, socket, pool) =>{
    
    socket.on("join_room", (data) =>{
        if(data !== null){
            var room = data[0];
            // CHANGE WITHOUT parseInt if doesnt work
            socket.join(room);
            socket.userId = room;
            console.log(`User: ${socket.id}, joined a room ${room}`);
        }
    });
}