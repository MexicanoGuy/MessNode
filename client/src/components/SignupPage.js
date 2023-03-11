import React from 'react'
import '../styles/loginPage.css';
import {useRef, useState, useEffect} from 'react';
import {Link, useParams, useLocation} from 'react-router-dom';
import io from 'socket.io-client';
import {CloudinaryContext, Image, ImageUploader} from 'cloudinary-react';
import ImgDrop from './dropzone/imgDrop';
import dotenv from 'dotenv';

dotenv.config({path: '.env'});
const socket = io.connect("localhost:3001");

function SignupPage() {
  console.log(process.env)
  const [emailValid, setEmailValid] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const [username, setUsername] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);

  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  
  const [pfpId, setPfpId] = useState('');
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);

  /*const dataCld = {
    cloudName: process.env.CNAME,
    apiKey: process.env.CAPIKEY,
    apiSecret: process.env.CAPISECRET,
    uploadPreset: process.env.CUPLOAD_PRESET
    // cloudName: 'dbz9t4cb6',
    // apiKey: '487621486735284',
    // apiSecret: '5iFhTeV3myX13qcc-_llf0_lhfY',
    // uploadPreset: 'r1l3esxv'
  }*/
  // const handleUpload = () =>{
  //   const formData = new FormData();
  //   formData.append('file', fileData);
  //   formData.append('upload_preset', dataCld.uploadPreset);
  //   formData.append('cloud_name', dataCld.cloudName);

  //   fetch(`https://api.cloudinary.com/v1_1/${dataCld.cloudName}/image/upload`, {
  //     method: 'POST',
  //     body: formData
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       setPfpId(data.public_id);
  //     }).catch((err) =>{
  //         console.log(err)
  //     });
  // }

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
      const accountData = {
        id: socket.id,
        email: emailAddress,
        username: username,
        pwd: password2,
        pfpId: pfpId
      }
      socket.emit('create_new_account', accountData);
    }
  }
  return (
    <div className='containerTab'>
      <div className='loginLabel'>Sign up</div>
      <input 
        type="email"
        placeholder='E-mail...' 
        onChange={(event) => {
          var regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
          setEmailValid(regex.test(event.target.value));
          setEmailAddress(event.target.value);
        }}
        className='emailInput'
      />
      {emailValid || emailAddress =='' ? null : <p className='errorText'>The email is not valid</p>}
      <input 
        type='text' 
        placeholder='Username...'
        className='usernameInput'
        pattern='^[a-zA-Z0-9_.-]*$'
        onChange={(event) =>{
          var usernameRegex = /^[a-zA-Z0-9_.-]*$/;
          setUsernameValid(usernameRegex.test(event.target.value));
          console.log(usernameValid)
          if(usernameValid){
            setUsername(event.target.value);
          }
        }} 
      />
      {usernameValid || username =='' ? null : <p className='errorText'>Your username is not valid</p>}

      <input 
        type='password'
        placeholder='Password...' 
        className='passwordInput'
        onChange={(event) =>{
          var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/;
          setPasswordValid(passwordRegex.test(event.target.value));
          console.log(passwordValid);
          if(passwordValid){
            setPassword1(event.target.value);
          }
        }}
      ></input>
      {passwordValid || password1=='' ? null : <ul className='errorText'>Password must contain: <br/>8-20 letter long, one a symbol, upper and lower case letters and a one number</ul>}
      <input 
        type='password' 
        placeholder='Confirm password...' 
        className='passwordInput'
        onChange={(event) =>{ 
          setPassword2(event.target.value);
        }}
      />
      {password1 !=='' && password2 !=='' ? <p className='errorText'> Password does {passwordMatch ? 'match' : 'not match'} </p> : null}   
      
      {file ? <img className='pfpImg' src={file} alt='no image'></img> : null}
      <ImgDrop onDrop={onDrop}/>

      <input
        type='submit'
        className='submit'
        onClick={CreateNewAccount}
        value='Sign up'
      ></input>
    <hr className='lineBreak'></hr>
    <p className='createAccount'><Link to={"/Login"}>Have an account? Click here!</Link> </p>
  </div>
  )
}

export default SignupPage