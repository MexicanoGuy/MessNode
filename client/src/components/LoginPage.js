import '../styles/loginPage.css';
import '../styles/loginPageMobile.css';
import {useState, useLayoutEffect, useEffect} from 'react';
import React from 'react'
import {Link, useNavigate} from 'react-router-dom';

export default function LoginPage(props) {
  
  const socket = props.socket;
  const isDesktop = props.isDesktop;
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
    <div className={isDesktop  ? 'containerLoginPage' : 'containerLoginPageRes'}>
        <div className={isDesktop  ? 'loginLabel' : 'loginLabelRes'}>Login</div>
        <input 
          type='email'
          placeholder='Email'
          onChange={(event) =>{
            setEmail(event.target.value);
          }}
          className={isDesktop  ? 'emailInputLogin' : 'emailInputLoginRes'}
          required>
        </input>
        <input 
          type='password'
          placeholder='Password...'
          className={isDesktop  ? 'passwordInputLogin' : 'passwordInputLoginRes'}
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
        {errorMsg ? <p className={isDesktop  ? 'errorTextLogin' : 'errorTextLoginRes'}>
          The credentials you've entered are incorrect!
        </p> : null}
        
        <input type='submit' className={isDesktop  ? 'loginInput' : 'loginInputRes'} onClick={Login} value='LOGIN'></input>
        <hr className={isDesktop  ? 'lineBreakLogin' : 'lineBreakLoginRes'}/>
        <p> <Link to={"/Signup"} className={isDesktop ? 'linkLogin' : 'linkLoginRes'}> 
          Don't have an account yet?  Sign up here!
        </Link> </p>
    </div>);
}