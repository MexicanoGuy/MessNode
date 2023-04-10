module.exports = (io, socket, pool) =>{
  
    socket.on('get_chat_data', async (data) =>{
      var convId = data.convId;
        const queryInfo = await pool.query(`
          SELECT * FROM (SELECT * FROM messages 
          INNER JOIN conversation ON convno = $1 AND conversationid = $1 
          INNER JOIN users ON messages.authorno = users.userid
          ORDER BY timestamp DESC LIMIT 10) 
          sub ORDER BY timestamp ASC`,[convId]);
        pool.end;
        let messagesData = [];
        const membersInfo = [];
        if(queryInfo.rowCount > 0){
          messagesData = queryInfo.rows.map(row =>({
            msgId: row.msgid,
            authorName: row.username,
            authorId: row.userid,
            authorPfp: row.pfp,
            content: row.content,
            timestamp: row.timestamp,
            convId: row.convno
          }));
          
          // SEARCH FOR PARTICIPANTS
          const members = queryInfo.rows[0].participants;
          if(members !== null){        
            for(let i=0; i<members.length; i++){
              let userQuery = await pool.query("SELECT * FROM users WHERE userid=$1 ORDER BY username ASC", [members[i]]);
              if(userQuery.rowCount > 0){
                let obj2 = {
                  userId: userQuery.rows[0].userid,
                  username: userQuery.rows[0].username,
                  pfp: userQuery.rows[0].pfp
                }
                membersInfo.push(obj2);
              }
            }
            pool.end;
          }
        }else{
          const convInfo = await pool.query("SELECT * FROM conversation WHERE conversationid=$1", [convId]);
          if(convInfo.rowCount > 0){
            const members = convInfo.rows[0].participants; 
            if(members !== null){        
              for(let i=0; i<members.length; i++){
                let userQuery = await pool.query("SELECT * FROM users WHERE userid=$1 ORDER BY username ASC", [members[i]]);
                if(userQuery.rowCount > 0){
                  let obj2 = {
                    userId: userQuery.rows[0].userid,
                    username: userQuery.rows[0].username,
                    pfp: userQuery.rows[0].pfp
                  }
                  membersInfo.push(obj2);
                }
              }
            }
            pool.end;
          }
        }
        socket.emit("receive_chat_data", {msgList: messagesData, memberList: membersInfo});
      });
}