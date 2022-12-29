module.exports = (io, socket, pool) =>{

    socket.on("send_message", async (data) => {
        const time = new Date(data.timestamp);
        // console.log(time);
        // socket.emit("receive_message", time);
        await pool.query("INSERT INTO messages(content, timestamp, author, convNo) values($1,$2,$3,$4)",[data.message, time, data.author, data.convNo])
        const queryInfo = await pool.query("SELECT msgId, content, author, timestamp FROM messages INNER JOIN conversation ON conversation.conversationid = $1 AND messages.convno = $1 ORDER BY timestamp ASC",[data.convNo])
        const messagesData = [];
  
        for(let i=0; i < queryInfo.rowCount; i++){
          let obj1 = {
            msgId: queryInfo.rows[i].msgid,
            content: queryInfo.rows[i].content,
            author: queryInfo.rows[i].author,
            timestamp: queryInfo.rows[i].timestamp,
          }
          messagesData.push(obj1);
          
        }
        console.log(messagesData);
        socket.emit("receive_message", messagesData);
      
      });
}