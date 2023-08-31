module.exports = (io, socket, pool) =>{
    const bcrypt = require('bcrypt');
    socket.on("create_new_account", async (data) =>{  
      console.log('asdadsad')
      var accountStatus = false;
      const findUser = await pool.query("SELECT email, pwd from users WHERE email=$1", [data.email]);
      
      if(!findUser.rows[0]){
        
        var hashedPwd = await bcrypt.hash(data.pwd, 10);
        
        await pool.query("INSERT INTO users(email, username, pwd, pfp) VALUES($1,$2,$3,$4) ", [data.email, data.username, hashedPwd, data.pfpId])
        console.log("creating new account");
        accountStatus = true;
        socket.emit("account_status", accountStatus);
      }else{
        console.log('not creating');
        socket.emit("account_status", accountStatus);
      }
      pool.end;
    });
}