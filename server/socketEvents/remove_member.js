module.exports = (io, socket, pool) =>{
  socket.on('remove_member', async (data)=>{
      let room = data.convId;
      const memberList = await pool.query("SELECT participants FROM conversation WHERE conversationid=$1",[data.convId]);
      if(data.userId !== data.memberId){
        var memberId = parseInt(data.memberId);
        if(memberList.rowCount > 0){
          var members = memberList.rows[0].participants;
          if(members.includes(memberId)){
            pool.query(`UPDATE conversation SET participants = array_remove(participants, $1) WHERE conversationid=$2`,[data.memberId, data.convId]);
            socket.to(parseInt(room)).emit('member_kicked', data.memberId);
            socket.to(parseInt(memberId)).emit('you_were_kicked', room);
          }
        }
      }
      pool.end;
  });
}