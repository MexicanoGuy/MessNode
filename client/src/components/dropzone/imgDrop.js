import React from 'react'
import Dropzone from "react-dropzone";
// import {useState} from 'react';
import '../../styles/imgDrop.css';

function ImgDrop(props) {

  // const [file, setFile] = useState(null);
  const onDrop = (acceptedFiles) => {
    const reader = new FileReader();
    reader.readAsDataURL(acceptedFiles[0]);
    reader.onloadend = () =>{
      props.onDrop(acceptedFiles, reader.result);
      // setFile(reader.result);
      // setFile(acceptedFiles[0]);
    }
  };
  return (
      <Dropzone onDrop={onDrop} maxFiles={1}>
        {({ getRootProps, getInputProps }) => (
          <div className='drop' {...getRootProps()}>
            <input {...getInputProps()}/>
            {/* {file ? <img className='pfpInside' src={file}></img> : <img className='attach' src={require('../../img/attach.png')}></img>} */}
            <img className='attach' alt='' src={require('../../img/attach.png')}></img>
            <p>Choose a file or drop it here...</p>
          </div>
        )}
      </Dropzone>
  )
}

export default ImgDrop