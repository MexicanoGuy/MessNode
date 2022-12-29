module.exports = (io, socket, data) =>{
    socket.on('give_admin', async (data)=>{
        const adminList = await pool.query("SELECT admins FROM conversation WHERE conversationid=$1",[data.convId]);
        
        if(adminList.rowCount > 0){
          var admins = adminList.rows[0].admins;
          if(!admins.includes(data.memberId))
            await pool.query(`UPDATE conversation SET admins = array_append(admins, $1) WHERE conversationid=$2`,[data.memberId, data.convId]);
        }
    });
};