module.exports = (io, socket, pool) =>{
  
    socket.on("create_new_chat", async (data) =>{  
      var users = [];
      users.push(data.creator);
      await pool.query("INSERT INTO conversation(conversationTitle, creator, participants, admins) VALUES($1, $2, $3, $4) ", [data.title, data.creator, users, users]);
      pool.end;  
    });
}