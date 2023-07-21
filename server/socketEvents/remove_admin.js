module.exports = (io, socket, pool) =>{
    
    socket.on('remove_admin', async (data)=>{
        const adminList = await pool.query("SELECT admins FROM conversation WHERE conversationid=$1",[data.convId]);
        console.log(data);
        if(adminList.rowCount > 0){
          var admins = adminList.rows[0].admins;
          if(admins.includes(data.memberId))
            await pool.query(`UPDATE conversation SET admins = array_remove(admins, $1) WHERE conversationid=$2`,[data.memberId, data.convId]);
        }
        pool.end;
    });
};