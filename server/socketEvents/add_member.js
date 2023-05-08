module.exports = (io, socket, pool) =>{

    socket.on("add_member", async (data) =>{
        const room = data.roomId;
        var userId = data.userId;
        await pool.query(`UPDATE conversation SET participants = array_append(participants, $1) WHERE conversationid = $2`,[userId, data.convId]);

        const user = await pool.query(`SELECT * FROM users WHERE userid = $1`, [userId]);
        userId = userId.toString().trim();
        if(user.rowCount > 0){
            var userData = {
                userId: user.rows[0].userid,
                username: user.rows[0].username,
                pfp: user.rows[0].pfp,
            }
            io.to(parseInt(room)).emit('member_added', userData);
        }
    
        io.to(parseInt(userId)).emit('added_to_conv', true);
        pool.end;
    });
}