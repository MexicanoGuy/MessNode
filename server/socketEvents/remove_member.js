module.exports = (io, socket, pool) =>{
    
    socket.on('remove_member', async (data)=>{
        const memberList = await pool.query("SELECT participants FROM conversation WHERE conversationid=$1",[data.convId]);
        pool.end;
        console.log('test',data);
        if(data.userId !== data.memberId){
          var memberId = parseInt(data.memberId);
          if(memberList.rowCount > 0){
            
            var members = memberList.rows[0].participants;
            console.log(members.includes(memberId));
            console.log(memberId);
            if(members.includes(memberId)){
              console.log('test')
              pool.query(`UPDATE conversation SET participants = array_remove(participants, $1) WHERE conversationid=$2`,[data.memberId, data.convId]);
            }
          }
        }else{
          console.log('nope!');
        }
        
        
      });
}