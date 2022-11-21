const express = require('express');
const app = express();
const http = require("http");
const {Server} = require('socket.io');
const bcrypt = require('bcryptjs');

const Redis = require('redis');
const redisClient = Redis.createClient();

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
      
      /*const userDuplicate =  await UserProfile.findOne({email: data.email}).exec();
      if(!userDuplicate){
        const profile = await UserProfile.create({
          email: data.email,
          username: data.username,
          pwd: data.password
        });
      }else{
        console.log("error creating/account exists")
        socket.emit("account_creation_status",{new: false});
      }*/
      
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
      
      const accountStatus = {
        result: false,
        username: ''
      }
      /*const emailFind = await UserProfile.findOne({email: data.email})
      
      if(emailFind){
        var correctPwd = emailFind.pwd;
        if(data.pwd === correctPwd) result = true;
      }
      
      socket.emit("receive_login_info", {result});*/
      const findUser = await pool.query("SELECT email, pwd, username from users WHERE email=$1", [data.email]);
      
      
      if(findUser !== undefined){
        console.log('checking passwords')
        const userPwd = findUser.rows[0].pwd;
        accountStatus.username = findUser.rows[0].username;
        
        const pwdMatch = await bcrypt.compare(data.pwd, userPwd);
        console.log(pwdMatch);
        if(pwdMatch) accountStatus.result = true;
      }
      
      
      socket.emit("receive_login_info", accountStatus);
    });
    socket.on("create_new_chat", async (data) =>{  
      await pool.query("INSERT INTO conversation(conversationTitle,creator) VALUES($1,$2) ", [data.title,data.creator]);
      //await pool.query("INSERT INTO conversationUsers(users) VALUES($1) ", [test]);
    });
    socket.on("get_user_data", async (data) =>{
      //console.log(data);

      const findUserConv = await pool.query("SELECT DISTINCT conversationid, conversationtitle, creator FROM conversation INNER JOIN users ON conversation.creator = $1",[data.username]);

      const conversations =[];
      for(let i=0; i < findUserConv.rowCount; i++){
        let obj1 = {
          convId: findUserConv.rows[i].conversationid,
          title: findUserConv.rows[i].conversationtitle
        }
        
        conversations.push(obj1);
        
      }
      //console.log(conversations)
      socket.emit("receive_user_data", conversations)
      //THEN EMIT DATA TO USER
    });
    socket.on('get_chat_data', async (data) =>{
      const queryInfo = await pool.query("SELECT msgId, content, author, timestamp, participants FROM messages INNER JOIN conversation ON conversation.conversationid = $1 AND messages.convno = $1 ORDER BY timestamp ASC",[data]);
      
      const messagesData = [];
      const membersInfo = [];
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

      const members = queryInfo.rows[0].participants;
      if(members !== null){        
        for(let i=0; i<members.length; i++){
          let userQuery = await pool.query("SELECT * FROM users WHERE userid=$1 ORDER BY username ASC", [members[i]]);
          let obj2 = {
            userId: userQuery.rows[0].userid,
            username: userQuery.rows[0].username,
            // userpfp: userQuery.rows[i].pfp;
          }
          membersInfo.push(obj2);
        }
      }
      console.log(membersInfo);
      socket.emit("receive_chat_data", {msgList: messagesData, memberList: membersInfo});
    })
    
    socket.on("join_room", (data) =>{
        
        socket.join(data.room);
        console.log(`User: ${socket.id}, joined a room ${data.room}`);
        
        const user = userJoin(data);
    });
    socket.on("leave_room", (data) =>{
        console.log(`User: ${socket.id}, left a room ${data.room}`); 
    });
    socket.on("send_message", async (data) => {
      //console.log(data);
      await pool.query("INSERT INTO messages(content, timestamp, author, convNo) values($1,$2,$3,$4)",[data.message, data.time, data.author, data.convNo])
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
      const queryUsers = await pool.query("SELECT * FROM users WHERE username=$1 LIKE ",[data]);

      console.log(queryUsers.rows[0]);
    })
})
io.on("disconnect", (socket) =>{
    
})
server.listen(3001, () => {
    console.log("Server is on!")
})