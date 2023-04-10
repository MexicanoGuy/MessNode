module.exports = (io, socket, pool) =>{

    socket.on("send_message", async (data) => {
        console.log(data)
        const room = data.convId;
        const time = new Date(data.timestamp);
        const queryInfo = await pool.query("INSERT INTO messages(content, timestamp, authorno, convno) values($1,$2,$3,$4) RETURNING msgid",[data.content, time, data.authorId, data.convId]);

        data.msgId = queryInfo.rows[0].msgid;
        socket.broadcast.to(room).emit("receive_message", data);
    });
}