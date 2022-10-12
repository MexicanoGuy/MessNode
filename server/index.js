const express = require('express');
const app = express();
const http = require("http");
const {Server} = require('socket.io');
const bcrypt = require('bcrypt');
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
//var conString = "postgres://jkwfxnqj:z5_h82Lsy4-VJgwjFjUT7c4YZg5tqrPe@tyke.db.elephantsql.com/jkwfxnqj" //Can be found in the Details page
//var conStringLocal = "localhost"
//var client = new pg.Client(conStringLocal);

const pool = require("./db");

/*pool.query('SELECT NOW()', (err,res) =>{
  //console.log(err,res);
  pool.end();
});*/

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
      const accountStatus ={
        status: true,
      }
      console.log(data);
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
      console.log(findUser.rows);
      if(findUser.rows){
        const hashedPwd = await bcrypt.hash(data.password, 10);
        
        pool.query("INSERT INTO users(email, username, pwd) VALUES($1,$2,$3) ", [data.email, data.username, hashedPwd])
        console.log("creating new account")
      }else{
        socket.emit("account_status", accountStatus) 
      }
      //pool.end();
    });
    socket.on("request_login_info", async (data) =>{
      /*const emailFind = await UserProfile.findOne({email: data.email})
      var result = false;
      if(emailFind){
        var correctPwd = emailFind.pwd;
        if(data.pwd === correctPwd) result = true;
      }
      
      socket.emit("receive_login_info", {result});*/
      const findUser = await pool.query("SELECT email, pwd from users WHERE email=$1", [data.email]);
      const userPwd = findUser.rows[0].pwd;
      const pwdMatch = await bcrypt.compare(data.password, userPwd);
      console.log(pwdMatch);
      
    })


    
    socket.on("join_room", (data) =>{
        
        socket.join(data.room);
        console.log(`User: ${socket.id}, joined a room ${data.room}`);
        
        const user = userJoin(data);
    });
    socket.on("leave_room", (data) =>{
        console.log(`User: ${socket.id}, left a room ${data.room}`);
    });
    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
    });

})
io.on("disconnect", (socket) =>{
    
})
server.listen(3001, () => {
    console.log("Server is on!")
})