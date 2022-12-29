module.exports = (io, socket, pool) =>{  
    socket.on("get_user_data", async (data) =>{
        const findUserConv = await pool.query("SELECT DISTINCT * FROM conversation WHERE $1 = ANY(conversation.participants)",[data.userId]);
        // const findUserConv2 = await pool.query("SELECT DISTINCT * FROM conversation INNER JOIN users ON conversation.participants = $1",[data.userId]);
  
        const conversations =[];
        for(let i=0; i < findUserConv.rowCount; i++){
          let obj1 = {
            convId: findUserConv.rows[i].conversationid,
            title: findUserConv.rows[i].conversationtitle
          }
          
          conversations.push(obj1);
          console.log(conversations);
        }
        pool.end;
        //console.log(conversations)
        socket.emit("receive_user_data", conversations)
        //THEN EMIT DATA TO USER
      });
}