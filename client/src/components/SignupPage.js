import React from 'react'
import '../styles/signupPage.css';
import {useRef, useState, useEffect} from 'react';
//import emailCheck from 'email-check';
import {Link, useParams, useLocation} from 'react-router-dom';
import io from 'socket.io-client';
const socket = io.connect("localhost:3001");

function SignupPage() {
  const type = useParams();
  //const stateParamValue = useLocation().state.stateParam;
  console.log("Props parameter value:", type);
  //console.log("Props state value:", stateParamValue);


  const [emailValid, setEmailValid] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const [username, setUsername] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);

  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  
  //CHECK IF PASSWORDS MATCH
  useEffect(() =>{
    
    if(password2 == password1 && password2 != '' && password2 !=''){
      setPasswordMatch(true)
    }else setPasswordMatch(false);

  },[password2])
  useEffect(() =>{
    socket.on("account_creation_status", (data) =>{
      
      console.log("test");
      if(data.new==false){
        alert("That account already exists!");
      }else{
        alert("Account succesfully created!");
      }
      
    })
  }, [])
  

  //SEND REQUEST TO CREATE NEW ACCOUNT TO SERVER
  const CreateNewAccount = async() =>{
    
    //Check email
    if(emailValid && usernameValid );
    
    //console.log(emailAddress);
    
    const accountData = {
      id: socket.id,
      email: emailAddress,
      username: username,
      pwd: password2,
    }
    socket.emit('create_new_account', accountData);
  }
  return (<>
    <div className='ContainerTab'>
        <div className='LoginLabel'>Signup Page</div>
        <div className='Inputs'>
              <div>
                <input 
                  type='text' 
                  placeholder='E-mail...' 
                  onChange={(event) => {
                    var regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                    
                    setEmailValid(regex.test(event.target.value));
                    setEmailAddress(event.target.value);
                    
                  }}
                  className=''>
                </input>
                {emailValid || emailAddress=='' ? <p></p> : <p>The email is not valid</p>}
              </div>
              
              <input 
                type='text' 
                placeholder='Username...' 
                onChange={(event) =>{
                  //VALIDATE USERNAME
                  var usernameRegex = /^[a-z0-9_\.]+$/;
                  setUsernameValid(usernameRegex.test(event.target.value));
                  if(usernameValid){
                    setUsername(event.target.value);
                  }
                }} 
                className='usernameInput'
              ></input>
              {usernameValid || username =='' ? <p></p> : <p>Your username is not valid</p>}
              <input 
                type='password'
                placeholder='Password...' 
                className='passwordInput'
                onChange={(event) =>{
                  setPassword1(event.target.value);
                  var passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
                  setPasswordValid(passwordRegex.test(event.target.value));
                  
                  //console.log(passwordValid);
                }}
              ></input>
              {passwordValid || password1=='' ? <p></p> : <p>Password must be 8-20 letter long, with at least a symbol, upper and lower case letters and a number</p>}
              <input 
                type='password' 
                placeholder='Confirm password...' 
                className='passwordInput'
                onChange={(event) =>{ 
                  setPassword2(event.target.value);
                }}
              ></input>
              {password1 !=='' && password2 !=='' ? <p> Password does {passwordMatch ? 'match' : 'not match'} </p> : <p></p>}
              
        </div>
        <div className='Buttons'>
            <button 
            className='submit'
            onClick={CreateNewAccount}
            >Sign up</button>
            
            <hr className='lineBreak'></hr>
            <p className='createAccount' ><Link to={"/Login"}>Have an account? Click here!</Link> </p>
        </div>
    </div>       
  </>)
}

export default SignupPage