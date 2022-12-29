module.exports = (io, socket, pool) =>{

    socket.on("addNewMember", async (data) =>{
        var userId = data.userId;
        pool.query(`UPDATE conversation SET participants = array_append(participants, $1) WHERE conversationid=$2`,[userId,data.convId]);
        pool.end;
    });
}