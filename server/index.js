const express = require('express');
const app = express();
const http = require("http");
const {Server} = require('socket.io');

const cors = require("cors");

app.use(cors());

const { MongoClient } = require("mongodb");
let mongoose = require('mongoose');
const uri = "mongodb+srv://root:Buraczan56sodu@chaos.azedixd.mongodb.net/test";
/*const client = new MongoClient(uri);
async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Establish and verify connection
    await client.db("root").command({ ping: 1 });
    console.log("Connected successfully to the MongoDB");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);*/

mongoose.connect(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
}, () => { 
  console.log('Connected successfully to the MongoDB') 
})


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});


//var pg = require('pg');
//or native libpq bindings
//var pg = require('pg').native

/*var conString = "postgres://jkwfxnqj:z5_h82Lsy4-VJgwjFjUT7c4YZg5tqrPe@tyke.db.elephantsql.com/jkwfxnqj" //Can be found in the Details page
var client = new pg.Client(conString);
client.connect(function(err) {
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
});
const {Pool, Client} = require('pg');

const pool = require("./db");

 
pool.query('SELECT NOW()', (err,res) =>{
  console.log(err,res);
  pool.end();
})
*/

const UserProfile = require('./mongoSchemas/UserProfile');

io.on("connection", (socket) => {
  console.log(`The ${socket.id} connected!`);
    
    socket.on("create_new_account", async (data) =>{
      console.log(data);
      
      
      const userDuplicate =  await UserProfile.findOne({email: data.email}).exec();
      //console.log(userDuplicate);
      if(!userDuplicate){
        const profile = await UserProfile.create({
          email: data.email,
          nickname: data.username,
          pwd: data.password
        });
        //console.log(profile);
        //profile.save();
        //console.log("Account created succesfully")
      
      }else{
        console.log("error creating/account exists")
        socket.emit("account_creation_status",{new: false});
      }
      
    });
    socket.on("request_login_info", async (data) =>{
      const emailFind = await UserProfile.findOne({email: data.email})
      var result = false;
      if(emailFind){
        var correctPwd = emailFind.pwd;
        if(data.pwd === correctPwd) result = true;
      }
      
      socket.emit("receive_login_info", {result});
    })


    
    socket.on("join_room", (data) =>{
        
        //console.log(users);
        
        socket.join(data.room);
        console.log(`User: ${socket.id}, joined a room ${data.room}`);
        
        const user = userJoin(data);
        //socket.emit("userlist_change", users);
        
    });
    socket.on("leave_room", (data) =>{

        //userLeave(data);
        //socket.to(data.room).emit("userlist_change", data);
        
        console.log(`User: ${socket.id}, left a room ${data.room}`);
    });
    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
    });

})
io.on("disconnect", (socket) =>{
    //userLeave(socket);
})
server.listen(3001, () => {
    console.log("Server is on!")
})