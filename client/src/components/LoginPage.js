import '../styles/loginPage.css';
import {useState, useEffect} from 'react';

import React, { Component } from 'react'
import {Link} from 'react-router-dom';
import io from 'socket.io-client';
const socket = io.connect("localhost:3001");
//import bcrypt from 'bcrypt';
import {useCookies} from 'react-cookie';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [errorMsg, setErrorMsg] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['user']);
    
    function Login(){
      const userData = {
        email: email,
        pwd: pwd
      }
      socket.emit("request_login_info", userData);
    }
    useEffect(()=>{
      socket.on("receive_login_info", (data) =>{
        if(data.result === true){
          //RENDER CHAT APP
          alert('You have successfully logged in!');
          setErrorMsg(false);

          const loginCookies = () =>{
            setCookie('email', email, {path:'/'});
            setCookie('pwd', pwd, {path:'/'});
          }

        }else{
          setErrorMsg(true);
        }
      });
    },[])

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
                className='passwordInput'> 
              </input>
              {errorMsg ? <p>The credentials you've entered are incorrect!</p> : <p></p>}
        </div>
        <div className='Buttons'>
            <button className='submit' onClick={Login}>LOGIN</button>
            <hr className='lineBreak'></hr>
            <p className='createAccount'> <Link to={"/Signup"}> Don't have an account yet?  Sign up here!</Link> </p>
            
        </div>

    </div>
  
  </>)
  
  }