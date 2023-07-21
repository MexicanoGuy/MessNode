module.exports = (io, socket, pool, data2) =>{
    if(data2){
        logout(io, socket, pool, data2);
    }else{
        socket.on('user_logout', async (data) =>{
            logout(io, socket, pool, data);
        });
    }
}

const logout = async (io, socket, pool, data) =>{
    var userId = data;
    var roomExists = io.sockets.adapter.rooms.has(userId);
    if(roomExists){
        var socketsInRoom = Array.from(io.sockets.adapter.rooms.get(userId));
        var otherSockets = socketsInRoom.filter(socketId => socketId !== socket.id);
    }
    if(!roomExists || otherSockets.length === 0){
            var statusData = await pool.query(`SELECT activity, customActivity FROM users WHERE userid=$1`,[userId]);
            if(statusData.rowCount > 0){
                var userStatus = 'Offline';
                var updatedUser = await pool.query(`
                    UPDATE users SET activity = $1 
                    WHERE userid=$2 
                    RETURNING userid, username, activity, customActivity, pfp
                    `, 
                [userStatus, userId]);

                var userConvs = await pool.query(`SELECT conversationId FROM conversation WHERE $1 = ANY (participants)`, [userId]);
                if(updatedUser.rowCount > 0 && userConvs.rowCount > 0){
                    var member = updatedUser.rows[0];
                    var memberData = {
                        userId: member.userid, 
                        username: member.username,
                        pfp: member.pfp,
                        activity: member.activity,
                        customActivity: member.customActivity
                    }
                    userConvs.rows.forEach(conv => {
                        io.to(conv.conversationid).emit('user_status_change', memberData);
                    });
                }
            }
    }
    pool.end;
}