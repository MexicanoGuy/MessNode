const moment = require('moment');
module.exports = (io, socket, pool) =>{
    socket.on("fetch_more_messages", async (data) =>{
        console.log('asda', data.lastMsgId)
        var date1 = new Date(data.oldestMessage);
        const sqlTimestamp = moment(date1).format('YYYY-MM-DD HH:mm:ss');
        const messages = await pool.query("SELECT * FROM (SELECT * FROM messages WHERE convno = $1 AND timestamp < $2 ORDER BY timestamp DESC LIMIT 10) sub ORDER BY timestamp ASC",[data.convId, sqlTimestamp]);
        if(messages.rowCount > 0){
            let messagesData = [];
            for(let i = 0; i < messages.rowCount; i++){
                let message = { msgId: '', author: '', content: '', timestamp: '' };
                message.msgId = messages.rows[i].msgid;
                message.author = messages.rows[i].author;
                message.content = messages.rows[i].content;
                message.timestamp = messages.rows[i].timestamp;
                messagesData.push(message);
            }
            socket.emit('receive_more_messages', messagesData);
        }
    });
}