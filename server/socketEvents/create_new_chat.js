module.exports = (io, socket, pool) =>{
  
    socket.on("create_new_chat", async (data) =>{
      console.log(data);
      var users = [];
      users.push(data.creator);
      await pool.query("INSERT INTO conversation(conversationTitle, creator, participants, admins, pic) VALUES($1, $2, $3, $4, $5) ", [data.title, data.creator, users, users, data.pic]);
      pool.end;
      socket.emit('chat_created', true);
    });
}