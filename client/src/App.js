import {React, useEffect, useState} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import MainPage from './components/MainPage';

function App(props){
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 767 ? true : false);
  
  const handleResize = () =>{
    setIsDesktop(window.innerWidth > 767 ? true : false);
  }

  useEffect(() =>{
    window.addEventListener('resize', handleResize);

    return() =>{
      window.removeEventListener('resize', handleResize)
    }
  }, []);
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Login"></Navigate>}></Route>
      <Route exact path="/Login" element={<LoginPage socket={props.socket} isDesktop={isDesktop}/>}/>
      <Route exact path="/Signup" element={<SignupPage socket={props.socket} isDesktop={isDesktop}/>}/>
      <Route exact path="/MainPage" element={<MainPage socket={props.socket} isDesktop={isDesktop}/>}/>
    </Routes> 
  );
}

export default App;