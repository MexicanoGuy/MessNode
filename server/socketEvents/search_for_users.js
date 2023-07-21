module.exports = (io, socket, pool) =>{
    
    socket.on('searchForUsers', async (data) =>{
        var username = '%' + data.searchValue + '%';
        const queryUsers = await pool.query("SELECT * FROM users WHERE username LIKE $1",[username]);
        const usersData = [];
        const alreadyAdded = await pool.query("SELECT participants FROM conversation WHERE conversationid=$1", [data.convId]);
        
        for(let i=0; i < queryUsers.rowCount; i++){ 
          var isAdded = null;
          if(alreadyAdded.rowCount > 0){
            var currentUser = queryUsers.rows[i].userid;
            var userId = "'" + alreadyAdded.rows[0].participants + "'";
            
            if(userId.includes(currentUser)){
              isAdded = true;
            }else{
              isAdded = false;
            }
          }
          let userObject = {
            userId: queryUsers.rows[i].userid,
            username: queryUsers.rows[i].username,
            email: queryUsers.rows[i].email,
            pfp: queryUsers.rows[i].pfp,
            isAdded: isAdded
          }
          usersData.push(userObject);
        }
        pool.end;
        socket.emit("receive_searched_users", usersData);
      });
}