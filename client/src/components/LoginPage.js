import '../styles/loginPage.css';
import {useState, useLayoutEffect, useEffect} from 'react';
import React from 'react'
import {Link, useNavigate} from 'react-router-dom';
import io from 'socket.io-client';
const socket = io.connect(process.env.REACT_APP_BACKEND_SERVER_URL);

export default function LoginPage() {
  
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);
  const navigate = useNavigate();
  
  useLayoutEffect(() =>{
    // <LoadingPage/>
    if(localStorage.getItem('email')){
      const userData = {
        email: localStorage.getItem('email'),
        pwd: localStorage.getItem('pwd')
      }
      socket.emit("request_login_info", userData);
    }
  },[]);
    
  function Login(){
    if(email && pwd){
      const userData = {
        email: email,
        pwd: pwd,
      }
      socket.emit("request_login_info", userData);
    }
  }
  useEffect(() =>{
    socket.off("receive_login_info").on("receive_login_info", async (result) =>{
      if(result.result === true){
        setErrorMsg(false);
        localStorage.setItem('email', email);
        localStorage.setItem('pwd', pwd);
        localStorage.setItem('username', result.username);
        localStorage.setItem('userId', result.userId);
        localStorage.setItem('pfp', result.pfp);

        await socket.emit('join_room', result.userId)
        await socket.emit('user_login', {userId: result.userId})
        navigate("/MainPage");
      }else{
        setErrorMsg(true);
      }
    });
  }, [socket])    
  

    return (
    <div className='containerLoginPage'>
        <div className='loginLabel'>Login</div>
        <input 
          type='email'
          placeholder='Email'
          onChange={(event) =>{
            setEmail(event.target.value);
          }}
          className='emailInputLogin' required>
        </input>
        <input 
          type='password' 
          placeholder='Password...'
          className='passwordInputLogin'
          onChange={(event) =>{
            setPwd(event.target.value);
          }}
          onKeyDown={(event)=>{
            event.key === "Enter" && Login();
          }}
          pattern="^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9a-zA-Z]).{8,}$"
          required
          > 
        </input>
        {errorMsg ? <p className='errorTextLogin'>The credentials you've entered are incorrect!</p> : null}
        
        <input type='submit' className='loginInput' onClick={Login} value='LOGIN'></input>
        <hr className='lineBreakLogin'></hr>
        <p> <Link to={"/Signup"} className='linkLogin'> Don't have an account yet?  Sign up here!</Link> </p> 
        
    </div>)
}