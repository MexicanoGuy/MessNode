module.exports = (io, socket, pool) =>{
    
    socket.on('leaveGroup', async (data) =>{
        const isEmpty1 = await pool.query("SELECT admins FROM conversation WHERE conversationid=$1", [data.convId]);
        if(isEmpty1.rowCount > 0){
          const adminPosition = await pool.query("SELECT array_position(admins, $1) FROM conversation WHERE conversationid=$2", [data.userId, data.convId]);
          //CHECK IF USER IS ADMIN IF NOT THEN DONT USE array_remove for admins
          if(adminPosition.rows[0].array_position > 0){
            await pool.query("UPDATE conversation SET participants = array_remove(participants, $1), admins = array_remove(admins, $1) WHERE conversationid=$2",[data.userId, data.convId]);
          }
        }else{
          await pool.query("UPDATE conversation SET participants = array_remove(participants, $1) WHERE conversationid=$2",[data.userId, data.convId]);
        }
  
        // await pool.query("UPDATE conversation SET participants = array_remove(participants, $1), admins = array_remove(admins, $1) WHERE conversationid=$2",[data.userId, data.convId]);
        // const isEmpty = pool.query("SELECT participants FROM conversation WHERE conversationid=$1", [data.convId]);
        pool.end;
      });
}