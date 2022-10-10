const rooms = [];
const room = {
    users: [],
    roomId: null,
};

function userJoin(data){
    //const userExists = users.find(data.id);
    const user = {
        id: data.id,
        username: data.username,
        room: data.room,
    }
    
    /*var findRoom = rooms.find(r => r[data.room]);
    if(findRoom){
        room[data.room].users.push(data.username);
        rooms.push(room);
    }else{
        rooms.push(room);
    }
    console.log('room update:');

    //console.log(rooms);
    for(var r in rooms){
        console.log(rooms[r]);
    }*/


    return user;
}
function userLeave(data){
    const id = data.id;
    //return (users.id.findIndex(id) > -1);
}
function getCurrentUserList(){
    return rooms;
}


module.exports = {
    userJoin,
    userLeave,
    getCurrentUserList,
};