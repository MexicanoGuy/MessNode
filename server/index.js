const express = require('express');
const app = express();
const http = require("http");
const {Server} = require('socket.io');
const bcrypt = require('bcryptjs');

// const Redis = require('redis');
// const redisClient = Redis.createClient();

const cors = require("cors");
app.use(cors());

/*const { MongoClient } = require("mongodb");
let mongoose = require('mongoose');
const uri = "mongodb+srv://root:Buraczan56sodu@chaos.azedixd.mongodb.net/test";
mongoose.connect(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
}, () => { 
  console.log('Connected successfully to the MongoDB') 
})
*/

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const pg = require('pg');
var conString = "postgres://jckwfzolztqref:31932f47a1ad2a1413fa78b91457dcfc4376c2cd7ba3d0e6b63ae572c94b404e@ec2-54-246-185-161.eu-west-1.compute.amazonaws.com:5432/d62hcpf032s5sv";

const pool = require("./db");

/*client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].theTime);
    // TIME
    client.end();
  });
});*/



//const UserProfile = require('./mongoSchemas/UserProfile');

io.on("connection", (socket) => {
  console.log(`The ${socket.id} connected!`);
    
    socket.on("create_new_account", async (data) =>{
      const accountStatus = {
        status: true,
      }
      
      pool.connect();
      const findUser = await pool.query("SELECT email, pwd from users WHERE email=$1", [data.email]);
      
      if(!findUser.rows[0]){
        
        var hashedPwd = await bcrypt.hash(data.pwd, 10);
        
        await pool.query("INSERT INTO users(email, username, pwd) VALUES($1,$2,$3) ", [data.email, data.username, hashedPwd])
        console.log("creating new account")
      }else{
        console.log('not creating')
        socket.emit("account_status", accountStatus)
      }
      //pool.end();
    });
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
      socket.emit("receive_login_info", accountStatus);
      
    });
    socket.on("create_new_chat", async (data) =>{  
      var users = [];
      users.push(data.creator);
      console.log(users);
      await pool.query("INSERT INTO conversation(conversationTitle, creator, participants, admins) VALUES($1, $2, $3, $4) ", [data.title, data.creator, users, users]);
    });
    socket.on("get_user_data", async (data) =>{
      console.log(data);
      const findUserConv = await pool.query("SELECT DISTINCT * FROM conversation WHERE $1 = ANY(conversation.participants)",[data.userId]);
      // const findUserConv2 = await pool.query("SELECT DISTINCT * FROM conversation INNER JOIN users ON conversation.participants = $1",[data.userId]);

      const conversations =[];
      for(let i=0; i < findUserConv.rowCount; i++){
        let obj1 = {
          convId: findUserConv.rows[i].conversationid,
          title: findUserConv.rows[i].conversationtitle
        }
        
        conversations.push(obj1);
        console.log(conversations);
      }
      //console.log(conversations)
      socket.emit("receive_user_data", conversations)
      //THEN EMIT DATA TO USER
    });
    socket.on('get_chat_data', async (data) =>{
      const queryInfo = await pool.query("SELECT * FROM messages INNER JOIN conversation ON conversation.conversationid = $1 AND messages.convno = $1 ORDER BY timestamp ASC",[data]);
      
      const messagesData = [];
      const membersInfo = [];
      if(queryInfo.rowCount > 0){

        for(let i=0; i < queryInfo.rowCount; i++){
          let obj1 = {
            msgId: queryInfo.rows[i].msgid,
            content: queryInfo.rows[i].content,
            author: queryInfo.rows[i].author,
            timestamp: queryInfo.rows[i].timestamp,
          }
          messagesData.push(obj1);
        }
        // SEARCH FOR PARTICIPANTS
        // console.log(queryInfo.rowCount);
        const members = queryInfo.rows[0].participants;
        if(members !== null){        
          for(let i=0; i<members.length; i++){
            let userQuery = await pool.query("SELECT * FROM users WHERE userid=$1 ORDER BY username ASC", [members[i]]);
            if(userQuery.rowCount > 0){
              let obj2 = {
                userId: userQuery.rows[0].userid,
                username: userQuery.rows[0].username,
                // userpfp: userQuery.rows[i].pfp;
              }
              membersInfo.push(obj2);
            }
          }
        }
      }else{
        const convInfo = await pool.query("SELECT * FROM conversation WHERE conversationid=$1", [data]);
        const members = convInfo.rows[0].participants;
        if(members !== null){        
          for(let i=0; i<members.length; i++){
            let userQuery = await pool.query("SELECT * FROM users WHERE userid=$1 ORDER BY username ASC", [members[i]]);
            if(userQuery.rowCount > 0){
              let obj2 = {
                userId: userQuery.rows[0].userid,
                username: userQuery.rows[0].username,
                // userpfp: userQuery.rows[i].pfp;
              }
              membersInfo.push(obj2);
            }
          }
        }
      }
      socket.emit("receive_chat_data", {msgList: messagesData, memberList: membersInfo});
    });
    
    socket.on("join_room", (data) =>{
        
        socket.join(data.room);
        console.log(`User: ${socket.id}, joined a room ${data.room}`);
        
        
    });
    socket.on("leave_room", (data) =>{
        console.log(`User: ${socket.id}, left a room ${data.room}`); 
    });
    socket.on("send_message", async (data) => {
      const time = new Date(data.timestamp);
      // console.log(time);
      // socket.emit("receive_message", time);
      await pool.query("INSERT INTO messages(content, timestamp, author, convNo) values($1,$2,$3,$4)",[data.message, time, data.author, data.convNo])
      const queryInfo = await pool.query("SELECT msgId, content, author, timestamp FROM messages INNER JOIN conversation ON conversation.conversationid = $1 AND messages.convno = $1 ORDER BY timestamp ASC",[data.convNo])
      const messagesData = [];

      for(let i=0; i < queryInfo.rowCount; i++){
        let obj1 = {
          msgId: queryInfo.rows[i].msgid,
          content: queryInfo.rows[i].content,
          author: queryInfo.rows[i].author,
          timestamp: queryInfo.rows[i].timestamp,
        }
        messagesData.push(obj1);
        
      }
      console.log(messagesData);
      socket.emit("receive_message", messagesData);
    
    });
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
          isAdded: isAdded
        }
        usersData.push(userObject);
      }
      // console.log(usersData);
      socket.emit("receive_searched_users", usersData);
    });
    socket.on("addNewMember", async (data) =>{
      var userId = data.userId;
      pool.query(`UPDATE conversation SET participants = array_append(participants, $1) WHERE conversationid=$2`,[userId,data.convId]);
    });

    socket.on("chat_permissions", async (data) =>{
      console.log(data);
      const adminList = await pool.query("SELECT admins FROM conversation WHERE conversationid=$1",[data.convId]);
      var isAdmin = {
        userAdmin: false,
        memberAdmin: false
      }

      if(adminList.rowCount > 0){
        const admins = adminList.rows[0].admins;
        var userId = parseInt(data.userId);
        var memberId = parseInt(data.memberId);

        if(admins.includes(userId)) isAdmin.userAdmin = true;
        if(admins.includes(memberId)) isAdmin.memberAdmin = true;
      }

      socket.emit("receive_chat", isAdmin);
    });
    const giveAdminEvent = require("./socketEvents/give_admin");
    giveAdminEvent(io, socket);
    // socket.on('give_admin', async (data)=>{
    //   const adminList = await pool.query("SELECT admins FROM conversation WHERE conversationid=$1",[data.convId]);
      
    //   if(adminList.rowCount > 0){
    //     var admins = adminList.rows[0].admins;
    //     if(!admins.includes(data.memberId))
    //       await pool.query(`UPDATE conversation SET admins = array_append(admins, $1) WHERE conversationid=$2`,[data.memberId, data.convId]);
    //   }
      
    // });

    socket.on('remove_admin', async (data)=>{
      const adminList = await pool.query("SELECT admins FROM conversation WHERE conversationid=$1",[data.convId]);
      console.log(data);
      if(adminList.rowCount > 0){
        var admins = adminList.rows[0].admins;
        if(admins.includes(data.memberId))
          await pool.query(`UPDATE conversation SET admins = array_remove(admins, $1) WHERE conversationid=$2`,[data.memberId, data.convId]);
      }
      
    });
    socket.on('remove_member', async (data)=>{
      const memberList = await pool.query("SELECT participants FROM conversation WHERE conversationid=$1",[data.convId]);
      console.log(data);
      var memberId = parseInt(data.memberId);
      if(memberList.rowCount > 0){
        
        var members = memberList.rows[0].participants;
        console.log(members.includes(memberId));
        console.log(memberId);
        if(members.includes(memberId)){
          console.log('test')
          // pool.query(`UPDATE conversation SET participants = array_remove(participants, $1) WHERE conversationid=$2`,[data.memberId, data.convId]);
        }
      }
      
    });
    socket.on('leaveGroup', async (data) =>{
      const isEmpty1 = await pool.query("SELECT admins FROM conversation WHERE conversationid=$1", [data.convId]);
      if(isEmpty1.rowCount > 0){
        const adminPosition = await pool.query("SELECT array_position(admins, $1) FROM conversation WHERE conversationid=$2", [data.userId, data.convId]);
        //CHECK IF USER IS ADMIN IF NOT THEN DONT USE array_remove for admins
        if(adminPosition.rows[0].array_position > 0){
          await pool.query("UPDATE conversation SET participants = array_remove(participants, $1), admins = array_remove(admins, $1) WHERE conversationid=$2",[data.userId, data.convId]);
        }
      }else{
        await pool.query("UPDATE conversation SET participants = array_remove(participants, $1) WHERE conversationid=$2",[data.userId, data.convId]);
      }

      // await pool.query("UPDATE conversation SET participants = array_remove(participants, $1), admins = array_remove(admins, $1) WHERE conversationid=$2",[data.userId, data.convId]);
      // const isEmpty = pool.query("SELECT participants FROM conversation WHERE conversationid=$1", [data.convId]);
      
    });
});
io.on("disconnect", (socket) =>{
    
})
server.listen(3001, () => {
    console.log("Server is on!")
})