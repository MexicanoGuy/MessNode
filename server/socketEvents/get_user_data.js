module.exports = (io, socket, pool) =>{  
    socket.on("get_user_data", async (data) =>{
        const findUserConv = await pool.query("SELECT DISTINCT * FROM conversation WHERE $1 = ANY(conversation.participants)",[data.userId]);
        const conversations = [];
        if(findUserConv.rowCount > 0){
          for(let i=0; i < findUserConv.rowCount; i++){
            let obj1 = {
              convId: findUserConv.rows[i].conversationid,
              title: findUserConv.rows[i].conversationtitle,
              pic: findUserConv.rows[i].pic
            }
            conversations.push(obj1);
          }
          pool.end;
          userToSocket(data.userId);
          socket.emit("receive_user_data", conversations)
        }
      });
    function userToSocket(userId){
      userId = parseInt(userId.trim(), 10);
      socket.join(userId);
      console.log(userId, 'joined a self room');
      
    }
}