module.exports = (io, socket, pool) =>{
    
    socket.on('leaveGroup', async (data) =>{
      const conv = await pool.query("SELECT participants, admins FROM conversation WHERE conversationid = $1", [data.convId]);
      let participants = await conv.rows[0].participants;
      let admins = await conv.rows[0].admins;
      let partCount = await participants.length;
      let adminCount = await conv.rows[0].admins.length;
      if(partCount == 1){
        console.log('option 1')
        await pool.query("DELETE FROM conversation WHERE conversationid = $1", [data.convId]);
      }
      if(adminCount == 1 && partCount > 1){
        console.log('option 3')
        let lastUser = participants.splice(data.userId, 1);
        if(lastUser.length = 1){
          lastUser = JSON.parse(lastUser);
          // console.log(l)
          await pool.query("UPDATE conversation SET participants = array_remove(participants, $1), admins = array_append(admins, $2) WHERE conversationid=$3",[data.userId, lastUser ,data.convId]);
          await pool.query("UPDATE conversation SET admins = array_remove(admins, $1) WHERE conversationid=$2",[data.userId ,data.convId]);
        }
      }
      if(partCount > 1 && adminCount > 1){
        console.log('option 2')
        await pool.query("UPDATE conversation SET participants = array_remove(participants, $1), admins = array_remove(admins, $1) WHERE conversationid=$2",[data.userId, data.convId]);  
      }
      pool.end;
    });
}