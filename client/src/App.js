import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import MainPage from './components/MainPage';

function App(props) {  
  return (
    <>
  <Routes>
    <Route path="/" element={<Navigate to="/Login"></Navigate>}></Route>
    <Route exact path="/Login" element={<LoginPage/>}></Route>
    <Route exact path="/Signup" element={<SignupPage/>}></Route>
    <Route exact path="/MainPage" element={<MainPage socket={props.socket}/>}></Route>
  </Routes> 
    </>
  );
}


export default App;
