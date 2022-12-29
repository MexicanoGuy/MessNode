module.exports = (io, socket, pool) =>{

  socket.on("chat_permissions", async (data) =>{
        console.log(data);
        const adminList = await pool.query("SELECT admins FROM conversation WHERE conversationid=$1",[data.convId]);
        var isAdmin = {
          userAdmin: false,
          memberAdmin: false
        }
  
        if(adminList.rowCount > 0){
          const admins = adminList.rows[0].admins;
          var userId = parseInt(data.userId);
          var memberId = parseInt(data.memberId);
  
          if(admins.includes(userId)) isAdmin.userAdmin = true;
          if(admins.includes(memberId)) isAdmin.memberAdmin = true;
        }
  
        socket.emit("receive_chat", isAdmin);
        pool.end;
    });
}