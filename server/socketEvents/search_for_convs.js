module.exports = (io, socket, pool) =>{

    socket.on("search_for_convs", async (data) =>{
        const searchConv = data.searchConv;
        const userId = data.userId;
        if(searchConv){
            var searchedPool = await pool.query(
                `SELECT DISTINCT conversationid, conversationtitle, conversation.pic 
                    FROM conversation 
                    INNER JOIN users 
                    ON
                    participants @> ARRAY[$1]::integer[]
                    WHERE
                    conversationTitle LIKE $2
                    `, [parseInt(userId), `%${searchConv}%`]
            );
            if(searchedPool.rowCount > 0){
                let convData = [];
                for(var i=0; i<searchedPool.rowCount; i++){
                    let conv = {
                        convId: searchedPool.rows[i].conversationid,
                        title: searchedPool.rows[i].conversationtitle,
                        pic: searchedPool.rows[i].pic
                    }
                    convData.push(conv);
                }
                socket.emit('receive_convs', convData);
            }
            pool.end;
        }
        // socket.emit('receive_convs', null);
    });
}