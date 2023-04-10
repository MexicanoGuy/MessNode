const moment = require('moment');

module.exports = (io, socket, pool) =>{
    socket.on("fetch_more_messages", async (data) =>{
        var date1 = new Date(data.oldestMessage);
        const sqlTimestamp = moment(date1).format('YYYY-MM-DD HH:mm:ss');        
        const messagesInfo = await pool.query(`
            SELECT * FROM (SELECT * FROM messages 
            INNER JOIN conversation ON convno = $1 AND conversationid = $1 
            INNER JOIN users ON messages.authorno = users.userid
            WHERE timestamp < $2
            ORDER BY timestamp DESC LIMIT 10) 
            sub ORDER BY timestamp ASC`,[data.convId, sqlTimestamp]
        );
        if(messagesInfo.rowCount > 0){
            let messagesData = messagesInfo.rows.map(row => ({
                msgId: row.msgid,
                authorName: row.username,
                authorId: row.userid,
                authorPfp: row.pfp,
                content: row.content,
                timestamp: row.timestamp,
                convId: row.convno
            }));
            socket.emit('receive_more_messages', messagesData);
        }else{
            socket.emit('receive_more_messages', false);
        }
    });
}