import React from 'react';
import {Routes, Route} from 'react-router-dom';

import io from 'socket.io-client';
import { useState } from 'react';
import Chat from './components/Chat';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import MainPage from './components/MainPage';

const socket = io.connect("localhost:3001");



function App() {
  


  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(true);

  const joinRoom = async () =>{
    if(username !== "" && room !== ""){
      const userData = {
        id: socket.id,
        username: username,
        room: room,
      };
      await socket.emit("join_room", userData);
      setShowChat(true);

    }
  }
  return (
    <>
  <Routes>
    <Route exact path="/Login" element={<LoginPage/>}></Route>
    <Route exact path="/Signup" element={<SignupPage/>}></Route>
    <Route exact path="/Chat" element={<Chat/>}></Route>
  </Routes>
  

    
    
      {<MainPage></MainPage>}
    
    </>
    
    /*<div className="App">
    {!showChat ? (
      <div className="joinChatContainer">
        <h1>Join A Chat With Room</h1>
        <input
          className='textBox'
          type="text"
          placeholder="Type your nickname..."
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />
        <input
          className='textBox'
          type="text"
          placeholder="Room Name..."
          onChange={(event) => {
            setRoom(event.target.value);
          }}
          onKeyPress={(event) => {
              event.key === "Enter" && joinRoom();
          }}
        />
        <button 
          onClick={joinRoom}
          >Join A Room</button>
      </div>
    ) : (
      <Chat socket={socket} username={username} room={room} />
    )}
  </div>*/
  );
}


export default App;
