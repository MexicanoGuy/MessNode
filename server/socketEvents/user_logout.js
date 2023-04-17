module.exports = (io, socket, pool) =>{
    socket.on('user_logout', async (data) =>{
        var userId = parseInt(data);
        console.log('Logout on close!"', userId, '"')

        // var socketsInRoom = new Set([...io.sockets.adapter.rooms.get(userId)]);
        // var socketsInRoom = io.sockets.adapter.rooms.get(userId);
        var socketsInRoom = io.sockets.adapter.rooms.get(userId);
        // console.log(socketsInRoom)
        var otherSockets = [...socketsInRoom].filter(socketId => socketId !== socket.id);
        if(!otherSockets || otherSockets == ''){
            var statusData = await pool.query(`SELECT activity, customActivity FROM users WHERE userid=$1`,[userId]);
            if(statusData.rowCount > 0){
                var userStatus = 'Offline';
                var updatedUser = pool.query(`
                    UPDATE users SET activity = $1 
                    WHERE userid=$2 
                    RETURNING userid, username, activity, customActivity, pfp
                    `, 
                [userStatus, userId]);
                
                console.log(`Changed user ${userId} activity status to ${userStatus}`);
                
                var userConvs = await pool.query(`SELECT conversationId FROM conversation WHERE $1 = ANY (participants)`, [userId]);
                if(updatedUser.rowCount > 0 && userConvs.rowCount > 0){
                    console.log('WORKS')
                    var member = updatedUser.rows[0];
                    var memberData = {
                        userId: member.userid, 
                        username: member.username,
                        pfp: member.pfp,
                        activity: member.activity,
                        customActivity: member.customActivity
                    }
                    userConvs.rows.forEach(conv => {
                        console.log("emitting to", conv.conversationid);
                        io.to(conv.conversationid).emit('update_member_status', memberData);
                    });
                }
            }
        }
        pool.end;
    });
}