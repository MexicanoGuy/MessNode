module.exports = (io, socket, pool) =>{
    
    socket.on('leaveGroup', async (data) =>{
      await pool.query("UPDATE conversation SET participants = array_remove(participants, $1), admins = array_remove(admins, $1) WHERE conversationid=$2",[data.userId, data.convId]);  
      pool.end;
    });
}