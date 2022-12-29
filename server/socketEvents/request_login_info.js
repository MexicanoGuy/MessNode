module.exports = (io, socket, pool) =>{
  const bcrypt = require('bcrypt');
    socket.on("request_login_info", async (data) =>{
        var accountStatus = {
          result: false,
          username: '',
          userId: ''
        }
        const findUser = await pool.query("SELECT email, pwd, username, userid from users WHERE email=$1 ", [data.email]);
          if(findUser.rowCount){
            // console.log('checking passwords')
            const userPwd = findUser.rows[0].pwd;
            const pwdMatch = bcrypt.compare(data.pwd, userPwd);
            // console.log(pwdMatch);
            if(pwdMatch){
              accountStatus = {
                result: true,
                username: findUser.rows[0].username,
                userId: findUser.rows[0].userid
              }
            } 
          }
          pool.end;
        socket.emit("receive_login_info", accountStatus);
        
      });
}