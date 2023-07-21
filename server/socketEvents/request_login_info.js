module.exports = (io, socket, pool) =>{
  const bcrypt = require('bcrypt');
  socket.on("request_login_info", async (data) =>{
      var accountStatus = {
        result: false,
        username: '',
        userId: '',
        pfp: ''
      }
      const findUser = await pool.query("SELECT * from users WHERE email=$1 ", [data.email]);
      if(findUser.rowCount){
        const userPwd = findUser.rows[0].pwd;
        const pwdMatch = await bcrypt.compare(data.pwd, userPwd);
        if(pwdMatch){
          accountStatus = {
            result: true,
            username: findUser.rows[0].username,
            userId: findUser.rows[0].userid,
            pfp: findUser.rows[0].pfp
          }
        } 
      }
      pool.end;
      socket.emit("receive_login_info", accountStatus);
  });
}