module.exports = (io, socket, pool) =>{
    
    socket.on('leaveGroup', async (data) =>{
      const conv = await pool.query("SELECT participants, admins FROM conversation WHERE conversationid = $1", [data.convId]);
      let participants = await conv.rows[0].participants;
      let admins = await conv.rows[0].admins;
      let partCount = await participants.length;
      let adminCount = await conv.rows[0].admins.length;
      
      if(partCount == 1){
        await pool.query("DELETE FROM conversation WHERE conversationid = $1", [data.convId]);
        await pool.query("DELETE FROM messages WHERE convNo = $1", [data.convId]);
        
        socket.to(parseInt(data.userId)).emit('remove_the_group', data.convId);
      }

      if(partCount > 1 && adminCount > 1){
        await pool.query("UPDATE conversation SET participants = array_remove(participants, $1), admins = array_remove(admins, $1) WHERE conversationid=$2",[data.userId, data.convId]);  
      
        socket.to(parseInt(data.convId)).emit('member_kicked', parseInt(data.userId));
        socket.to(parseInt(data.userId)).emit('remove_the_group', data.convId);
      }
      
      if(adminCount == 1 && partCount > 1){
        let firstUser = participants.filter(part => part !== parseInt(data.userId));        
        firstUser = firstUser[0];

        if(admins.includes(parseInt(data.userId))){
          await pool.query("UPDATE conversation SET participants = array_remove(participants, $1), admins = array_append(admins, $2) WHERE conversationid=$3",[data.userId, firstUser ,data.convId]);
          await pool.query("UPDATE conversation SET admins = array_remove(admins, $1) WHERE conversationid=$2",[data.userId, data.convId]);
          
          socket.to(parseInt(data.userId)).emit('remove_the_group', data.convId);
        }else{
          await pool.query("UPDATE conversation SET participants = array_remove(participants, $1) WHERE conversationid=$2",[data.userId ,data.convId]);
          
          socket.to(parseInt(data.convId)).emit('member_kicked', parseInt(data.userId));
          socket.to(parseInt(data.userId)).emit('remove_the_group', data.convId);
        }
      }
      pool.end;
    });
}