import '../styles/loginPage.css';
import {useState, useEffect, useLayoutEffect} from 'react';

import React, { Component } from 'react'
import {Link, useNavigate} from 'react-router-dom';
import io from 'socket.io-client';

import {useCookies} from 'react-cookie';


import LoadingPage from '../components/LoadingPage';

const socket = io.connect("localhost:3001");

export default function LoginPage() {
  
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['user']);
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
      const userData = {
        email: email,
        pwd: pwd
      }
      socket.emit("request_login_info", userData);
    }
      
      socket.on("receive_login_info", (result) =>{
        if(result.result == true){
          //RENDER CHAT APP
          //alert('You have successfully logged in!');
          setErrorMsg(false);
          localStorage.setItem('email',email);
          localStorage.setItem('pwd', pwd);
          localStorage.setItem('username', result.username);
          localStorage.setItem('userId', result.userId)
          
          navigate("/MainPage");
        }else{
          setErrorMsg(true);
        }
      });

    return (<>
    
    <div className='ContainerTab'>
        <div className='LoginLabel'>Login Page</div>
        <div className='Inputs'>
              <h3>Email</h3>
              <input 
                type='text' 
                placeholder='E-mail...'
                onChange={(event) =>{
                  setEmail(event.target.value);
                }}
                className='emailInput'>
              </input>
              <input 
                type='password' 
                placeholder='Password...'
                onChange={(event) =>{
                  setPwd(event.target.value);
                }}
                onKeyPress={(event)=>{
                  event.key === "Enter" && Login();
                }}
                className='passwordInput'> 
              </input>
              {errorMsg ? <p>The credentials you've entered are incorrect!</p> : <p></p>}
        </div>
        <div className='Buttons'>
            <button  className='submit'  onClick={Login} >LOGIN</button>
            <hr className='lineBreak'></hr>
            <p className='createAccount'> <Link to={"/Signup"}> Don't have an account yet?  Sign up here!</Link> </p>
            
        </div>

    </div>
  
  </>)
  
  }