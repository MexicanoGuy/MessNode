import React from 'react'
import '../styles/signupPage.css';
import {useRef, useState, useEffect} from 'react';
import {Link, useParams, useLocation, useNavigate} from 'react-router-dom';
import io from 'socket.io-client';
import {CloudinaryContext, Image, ImageUploader} from 'cloudinary-react';
import ImgDrop from './dropzone/imgDrop';

const socket = io.connect("localhost:3001");

function SignupPage() {
  const navigate = useNavigate();

  const [emailValid, setEmailValid] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const [username, setUsername] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);

  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  const [accountCreated, setAccountCreated] = useState('');
  
  const [pfpId, setPfpId] = useState(null);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);

  const dataCld = {
    cloudName: process.env.REACT_APP_CNAME,
    apiKey: process.env.REACT_APP_CAPIKEY,
    apiSecret: process.env.REACT_APP_CSECRET,
    uploadPreset: process.env.REACT_APP_CUPLOAD_PRESET
  }
  const handleUpload = () =>{
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', dataCld.uploadPreset);
    formData.append('cloud_name', dataCld.cloudName);

    fetch(`https://api.cloudinary.com/v1_1/${dataCld.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      setPfpId(data.public_id);
    }).catch((err) =>{
        // console.log(err)
    });
  }

  useEffect(() =>{
    if(password2 == password1 && password2 != '' && password2 !=''){
      setPasswordMatch(true)
    }else setPasswordMatch(false);
  },[password2])
  useEffect(() =>{
    socket.on("account_creation_status", (data) =>{
      if(data.new==false){
        alert("That account already exists!");
      }else{
        alert("Account succesfully created!");
      }
    })
  }, []);
  const onDrop = async(data, fileR) =>{
    setFileData(data);
    setFile(fileR);
  };
  const CreateNewAccount = async() =>{
    if(emailValid && usernameValid && file && passwordValid){
      handleUpload();
    }
  }
  useEffect(() =>{
    if(emailValid && usernameValid && file && passwordValid){
      const accountData = {
        id: socket.id,
        email: emailAddress,
        username: username,
        pwd: password2,
        pfpId: pfpId
      }
      console.log(accountData)
      socket.emit('create_new_account', accountData);
    }
  },[pfpId]);
  useEffect(() =>{
    socket.off('account_status').on('account_status', (data) =>{
      if(data === true){
        setAccountCreated(true);
        alert('Account successfully created!');
        navigate('/Login');
      }
      else if(data === false){
        setAccountCreated(false);
      }
    });
  }, [socket]);
  return (
    <div className='containerRegisterPage'>
      <div className='registerLabel'>Sign up</div>
      <input 
        type="email"
        placeholder='E-mail...' 
        onChange={(event) => {
          var regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
          setEmailValid(regex.test(event.target.value));
          setEmailAddress(event.target.value);
        }}
        className='emailInputRegister'
      />
      {emailValid || emailAddress =='' ? null : <p className='errorTextRegister'>The email is not valid</p>}
      <input 
        type='text' 
        placeholder='Username...'
        className='usernameInputRegister'
        pattern='^[a-zA-Z0-9_.-]*$'
        onChange={(event) =>{
          var usernameRegex = /^[a-zA-Z0-9_.-]*$/;
          setUsernameValid(usernameRegex.test(event.target.value));
          if(usernameValid){
            setUsername(event.target.value);
          }
        }} 
      />
      {usernameValid || username =='' ? null : <p className='errorTextRegister'>Your username is not valid</p>}

      <input 
        type='password'
        placeholder='Password...' 
        className='passwordInputRegister'
        onChange={(event) =>{
          var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/;
          setPasswordValid(passwordRegex.test(event.target.value));
          if(passwordValid){
            setPassword1(event.target.value);
          }
        }}
      ></input>
      {passwordValid || password1=='' ? null : <ul className='errorTextRegister'>Password must contain: <br/>8-20 letter long, one a symbol, upper and lower case letters and a one number</ul>}
      <input 
        type='password' 
        placeholder='Confirm password...' 
        className='passwordInputRegister'
        onChange={(event) =>{ 
          setPassword2(event.target.value);
        }}
      />
      {password1 !=='' && password2 !=='' ? <p className='errorTextRegister'> Password does {passwordMatch ? 'match' : 'not match'} </p> : null}   
      
      {file ? <img className='pfpRegister' src={file} alt='no image'></img> : null}
      <ImgDrop onDrop={onDrop}/>

      <input
        type='submit'
        className='registerInput'
        onClick={CreateNewAccount}
        value='Sign up'
      ></input>
      {accountCreated === false ? <p className='errorTextRegister'>Account with given email already exists</p> : null}
    <hr className='lineBreakRegister'></hr>
    <p><Link to={"/Login"} className='linkRegister'>Have an account? Click here!</Link> </p>
  </div>
  )
}

export default SignupPage