module.exports = (io, socket, pool) =>{
    socket.on('user_login', async (data) =>{
        var userId = data.userId;
        var roomExists = io.sockets.adapter.rooms.has(userId);
        if(roomExists){
            var socketsInRoom = Array.from(io.sockets.adapter.rooms.get(userId));
            var otherSockets = socketsInRoom.filter(socketId => socketId !== socket.id);
        }
        if(!roomExists || otherSockets.length === 0){
            var statusData = await pool.query(`SELECT activity, customActivity FROM users WHERE userid=$1`,[userId]);
            if(statusData.rowCount > 0){
                var customActivity = statusData.rows[0].customactivity;
                if(customActivity != null){
                    var userStatus = 'Custom';
                }else{
                    var userStatus = 'Online';
                }
                var user = await pool.query(`UPDATE users SET activity = $1 WHERE userid=$2 RETURNING *`, [userStatus, userId]);
                // console.log(`Changed users ${userId} activity status to ${userStatus}`);

                // ADVERTISE TO ACTIVE CONVS
                var userConvs = await pool.query(`SELECT conversationId FROM conversation WHERE $1 = ANY (participants)`, [parseInt(userId)]);
                
                if(userConvs.rowCount > 0 && user.rowCount > 0){
                    var userRow = user.rows[0];
                    var memberData = {
                        userId: userRow.userid, 
                        username: userRow.username,
                        pfp: userRow.pfp,
                        activity: userRow.activity,
                        customActivity: userRow.customActivity
                    }
                    userConvs.rows.forEach(conv => {
                        // console.log("emitting to", conv.conversationid)
                        io.to(parseInt(conv.conversationid)).emit("user_status_change", memberData);
                    });
                }
            }
            // socket.userId = userId;
            pool.end;
        }
    });
}