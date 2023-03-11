import '../styles/loginPage.css';
import {useState, useLayoutEffect} from 'react';
import React from 'react'
import {Link, useNavigate} from 'react-router-dom';
import io from 'socket.io-client';
const socket = io.connect("localhost:3001");

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
      
      socket.on("receive_login_info", (result) =>{
        if(result.result === true){
          setErrorMsg(false);
          localStorage.setItem('email',email);
          localStorage.setItem('pwd', pwd);
          localStorage.setItem('username', result.username);
          localStorage.setItem('userId', result.userId)
          localStorage.setItem('pfp', result.pfp)
          navigate("/MainPage");
        }else{
          setErrorMsg(true);
        }
      });

    return (<>
    <div className='containerTab'>
        <div className='loginLabel'>Login</div>
        <input 
          type='email'
          placeholder='Email'
          onChange={(event) =>{
            setEmail(event.target.value);
          }}
          className='emailInput' required>
        </input>
        <input 
          type='password' 
          placeholder='Password...'
          className='passwordInput'
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
        {errorMsg ? <p className='errorText'>The credentials you've entered are incorrect!</p> : <></>}
        
        <input type='submit' className='submit'  onClick={Login} value='LOGIN'></input>
        <hr className='lineBreak'></hr>
        <p className='link'> <Link to={"/Signup"}> Don't have an account yet?  Sign up here!</Link> </p> 
        
    </div>
    </>)
}