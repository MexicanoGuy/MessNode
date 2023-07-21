module.exports = (io, socket, pool) =>{

    socket.on("send_message", async (data) => {
        const room = data.convId;
        const time = new Date(data.timestamp);
        const queryInfo = await pool.query(`INSERT INTO 
            messages(content, timestamp, messageType, authorno, convno) 
            values($1,$2,$3,$4,$5) RETURNING msgid`,
        [data.content, time, data.messageType, data.authorId, data.convId]);

        data.msgId = queryInfo.rows[0].msgid;
        pool.end;
        socket.broadcast.to(room).emit("receive_message", data);
    });
}