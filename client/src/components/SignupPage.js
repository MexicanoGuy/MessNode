import React from 'react'
import '../styles/signupPage.css';
import {useRef, useState, useEffect} from 'react';
import {Link, useParams, useLocation} from 'react-router-dom';
import io from 'socket.io-client';
import {CloudinaryContext, Image, ImageUploader} from 'cloudinary-react';
const socket = io.connect("localhost:3001");

function SignupPage() {

  const [emailValid, setEmailValid] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const [username, setUsername] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);

  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  
  const [pfpId, setPfpId] = useState('');
  const [pfpFile , setPfpFile] = useState('');
  
  const dataCld = {
    cloudName: 'dbz9t4cb6',
    apiKey: '487621486735284',
    apiSecret: '5iFhTeV3myX13qcc-_llf0_lhfY'
  }
  const handleUpload = () =>{
    const formData = new FormData();
    formData.append('file', pfpFile);
    formData.append('upload_preset', 'r1l3esxv');
    formData.append('cloud_name', 'dbz9t4cb6');

    fetch(`https://api.cloudinary.com/v1_1/${dataCld.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        setPfpId(data.public_id);
      }).catch((err) =>{
          console.log(err)
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
  }, [])
  
  //SEND REQUEST TO CREATE NEW ACCOUNT TO SERVER
  const CreateNewAccount = async() =>{
    handleUpload()
    if(emailValid && usernameValid && pfpId){
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
  return (<>
    <div className='ContainerTab'>
        <div className='LoginLabel'>Signup Page</div>
        <div className='Inputs'>
                <input 
                  type="email" 
                  placeholder='E-mail...' 
                  onChange={(event) => {
                    var regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                    setEmailValid(regex.test(event.target.value));
                    setEmailAddress(event.target.value);
                    
                  }}
                  className='emailInput2'
                />
                {emailValid || emailAddress =='' ? <></> : <p>The email is not valid</p>}
                
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
                  className='usernameInput2'
                />
              
              {usernameValid || username =='' ? <></> : <p>Your username is not valid</p>}

              <CloudinaryContext cloudName={dataCld.cloudName}>
                <input type='file' onChange={e => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = () => {
                      setPfpFile(reader.result);
                    };
                    reader.readAsDataURL(file);
                }}/>
              </CloudinaryContext>
              <img src={pfpFile}/>

              <input 
                type='password'
                placeholder='Password...' 
                className='passwordInput2'
                onChange={(event) =>{
                  setPassword1(event.target.value);
                  var passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
                  setPasswordValid(passwordRegex.test(event.target.value));
                }}
              ></input>
              {passwordValid || password1=='' ? <></> : <p>Password must be 8-20 letter long, with at least a symbol, upper and lower case letters and a number</p>}
              <input 
                type='password' 
                placeholder='Confirm password...' 
                className='passwordInput2'
                onChange={(event) =>{ 
                  setPassword2(event.target.value);
                }}
              ></input>
              {password1 !=='' && password2 !=='' ? <p> Password does {passwordMatch ? 'match' : 'not match'} </p> : <></>}
              
        </div>
        <div className='Buttons'>
            <button 
            className='submit2'
            onClick={CreateNewAccount}
            >Sign up</button>
        
            <hr className='lineBreak2'></hr>
            <p className='createAccount2' ><Link to={"/Login"}>Have an account? Click here!</Link> </p>
        </div>
    </div>       
  </>)
}

export default SignupPage