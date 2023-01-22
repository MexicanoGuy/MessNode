module.exports = (io, socket, pool) =>{
  
    socket.on('get_chat_data', async (data) =>{
      var convId = data.convId;
        const queryInfo = await pool.query("SELECT * FROM (SELECT * FROM messages INNER JOIN conversation ON convno = $1 AND conversationid = $1 ORDER BY timestamp DESC LIMIT 10) sub ORDER BY timestamp ASC",[convId]);
        pool.end;
        const messagesData = [];
        const membersInfo = [];
        if(queryInfo.rowCount > 0){
  
          for(let i=0; i < queryInfo.rowCount; i++){
            let obj1 = {
              msgId: queryInfo.rows[i].msgid,
              content: queryInfo.rows[i].content,
              author: queryInfo.rows[i].author,
              timestamp: queryInfo.rows[i].timestamp,
            }
            messagesData.push(obj1);
          }
          // SEARCH FOR PARTICIPANTS
          const members = queryInfo.rows[0].participants;
          if(members !== null){        
            for(let i=0; i<members.length; i++){
              let userQuery = await pool.query("SELECT * FROM users WHERE userid=$1 ORDER BY username ASC", [members[i]]);
              if(userQuery.rowCount > 0){
                let obj2 = {
                  userId: userQuery.rows[0].userid,
                  username: userQuery.rows[0].username,
                  // userpfp: userQuery.rows[i].pfp;
                }
                membersInfo.push(obj2);
              }
            }
            pool.end;
          }
        }else{
          const convInfo = await pool.query("SELECT * FROM conversation WHERE conversationid=$1", [convId]);
          const members = convInfo.rows[0].participants;
          if(members !== null){        
            for(let i=0; i<members.length; i++){
              let userQuery = await pool.query("SELECT * FROM users WHERE userid=$1 ORDER BY username ASC", [members[i]]);
              if(userQuery.rowCount > 0){
                let obj2 = {
                  userId: userQuery.rows[0].userid,
                  username: userQuery.rows[0].username,
                  // userpfp: userQuery.rows[i].pfp;
                }
                membersInfo.push(obj2);
              }
            }
          }
          pool.end;
        }
        socket.emit("receive_chat_data", {msgList: messagesData, memberList: membersInfo});
      });
}