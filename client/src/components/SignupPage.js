import React from 'react'
import '../styles/signupPage.css';
import '../styles/signupPageMobile.css';
import {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import io from 'socket.io-client';
import ImgDrop from './dropzone/imgDrop';
import ReactLoading from 'react-loading';
import LoadingComponent from 'react-loading';

function SignupPage(props) {

  var isDesktop = props.isDesktop;
  const navigate = useNavigate();
  const socket = props.socket;

  const [emailValid, setEmailValid] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const [username, setUsername] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);

  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  const [createdSuccessfully, setCreatedSuccessfully] = useState('');
  const [awaitingAccount, setAwaitingAccount] = useState(false);

  const [pfpId, setPfpId] = useState(null);
  const [file, setFile] = useState(null);

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
    if(password2 === password1 && password2 != '' && password2 !=''){
      setPasswordMatch(true)
    }else setPasswordMatch(false);
  },[password1, password2]);
  useEffect(() =>{
    socket.off("account_creation_status").on("account_creation_status", (data) =>{
      if(data.new === false){
        alert("That account already exists!");
      }else{
        console.log('glitch')
      }
    })
  }, []);
  const onDrop = async(data, fileR) =>{
    // setFileData(data);
    setFile(fileR);
  };
  const CreateNewAccount = () =>{
    if(emailValid && usernameValid && file && passwordValid){
      handleUpload();
    }
  }
  useEffect(() =>{
    if(emailValid && usernameValid && passwordValid){
      const accountData = {
        id: socket.id,
        email: emailAddress,
        username: username,
        pwd: password2,
        pfpId: pfpId
      }
      socket.emit('create_new_account', accountData);
      setAwaitingAccount(true);
    }
  },[pfpId]);
  useEffect(() =>{
    socket.on('account_status', (data) =>{
      if(data === true){
        setCreatedSuccessfully(true);
        alert('Account successfully created!');
        navigate('/Login');
      }
      else{
        setCreatedSuccessfully(false);
      }
      setAwaitingAccount(false);
    });
  }, [socket]);
  return (
    <>
    {awaitingAccount ?
        <div className='loadingContainerRegister'>
          <LoadingComponent type='spinningBubbles' className='loadingRegister' color='#000000' width='60px'/>
        </div>
      : null}
    <div className={ isDesktop ? 'containerRegisterPage' : 'containerRegisterPageRes'}>
      
      <div className={ isDesktop ? 'registerLabel' : 'registerLabelRes'}>Sign up</div>
      <input 
        type="email"
        placeholder='E-mail...' 
        onChange={(event) => {
          var regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
          setEmailValid(regex.test(event.target.value));
          setEmailAddress(event.target.value);
        }}
        className={ isDesktop ? 'emailInputRegister ' : 'emailInputRegisterRes'}
      />
      {emailValid || emailAddress ==='' ? null : 
        <p className={ isDesktop ? 'errorTextRegister' : 'errorTextRegisterRes'}>
        The email is not valid</p>
      }
      <input 
        type='text' 
        placeholder='Username...'
        className={ isDesktop ? 'usernameInputRegister' : 'usernameInputRegisterRes'}
        pattern='^[a-zA-Z0-9_.-]*$'
        onChange={(event) =>{
          var usernameRegex = /^[a-zA-Z0-9_.-]*$/;
          setUsernameValid(usernameRegex.test(event.target.value));
          if(usernameValid){
            setUsername(event.target.value);
          }
        }} 
      />
      {usernameValid || username === '' ? null : 
      <p className={ isDesktop ? 'errorTextRegister' : 'errorTextRegisterRes'}>
        Your username is not valid
      </p>}

      <input 
        type='password'
        placeholder='Password...' 
        className={ isDesktop ? 'passwordInputRegister' : 'passwordInputRegisterRes' }
        pattern="(?=.*[A-Z])(?=.*[\W_]).{8,20}"
        onChange={(event) =>{
          var passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,20}$/;
          setPasswordValid(passwordRegex.test(event.target.value));
          if(passwordValid){
            setPassword1(event.target.value);
          }
        }}
      />
      {passwordValid || password1 =='' ? null : 
        <ul className={ isDesktop ? 'errorTextRegister' : 'errorTextRegisterRes'}>
          Password must contain: <br/>8-20 letter long, one a symbol, upper and lower case letters and a one number
        </ul>}
      <input 
        type='password' 
        placeholder='Confirm password...' 
        className={ isDesktop ? 'passwordInputRegister' : 'passwordInputRegisterRes'}
        pattern="(?=.*[A-Z])(?=.*[\W_]).{8,20}"
        onChange={(event) =>{ 
          setPassword2(event.target.value);
        }}
      />
      {password1 !=='' && password2 !=='' ? 
        <p className={ isDesktop ? 'errorTextRegister' : 'errorTextRegisterRes'}> 
          Password does {passwordMatch ? 'match' : 'not match'} 
        </p> : null
      }   
      
      {file ? <img className={ isDesktop ? 'pfpRegister' : 'pfpRegisterRes'} src={file} alt='no image'/> : null}
      <ImgDrop isDesktop={isDesktop} onDrop={onDrop}/>

      <input
        type='submit'
        className={ isDesktop ? 'registerInput' : 'registerInputRes'}
        onClick={CreateNewAccount}
        value='Sign up'
      />
      {createdSuccessfully === false ? 
        <p className={ isDesktop ? 'errorTextRegister' : 'errorTextRegisterRes'}>
          Account with given email already exists
        </p> 
      : null}
    <hr className={ isDesktop ? 'lineBreakRegister' : 'lineBreakRegisterRes'}/>
    <p>
      <Link 
        to={"/Login"} 
        className={ isDesktop ? 'linkRegister' : 'linkRegisterRes'}>
        Have an account? Click here!
      </Link>
    </p>
  </div>
  </>
  )
}

export default SignupPage