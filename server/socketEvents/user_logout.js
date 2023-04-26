module.exports = (io, socket, pool) =>{
    socket.on('user_logout', async (data) =>{
        var userId = data;
        // var userId = parseInt(data);
        var roomExists = io.sockets.adapter.rooms.has(userId);
        if(roomExists){
            var socketsInRoom = Array.from(io.sockets.adapter.rooms.get(userId));
            console.log('All sockets in room: ', socketsInRoom)
            var otherSockets = socketsInRoom.filter(socketId => socketId !== socket.id);
            console.log('Filtered: ', otherSockets)
            if(!otherSockets || otherSockets == '' || socketsInRoom === otherSockets){
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
        }else{
            console.log('no conv', roomExists)
        }
        pool.end;
    });
}