import React from 'react'
import Dropzone from "react-dropzone";
import {useRef, useState, useEffect} from 'react';
import '../../styles/imgDrop.css';

function ImgDrop(props) {

  const [file, setFile] = useState(null);
  const onDrop = (acceptedFiles) => {
    const reader = new FileReader();
    reader.readAsDataURL(acceptedFiles[0]);
    reader.onloadend = () =>{
      props.onDrop(acceptedFiles, reader.result);
    }
  };
  return (
      <Dropzone onDrop={onDrop} maxFiles={1}>
        {({ getRootProps, getInputProps }) => (
          <div className='drop' {...getRootProps()}>
            <input {...getInputProps()}/>
            <p><img className='attach' src={require('../../img/attach.png')}></img>Drop file here</p>
          </div>
        )}
      </Dropzone>
  )
}

export default ImgDrop