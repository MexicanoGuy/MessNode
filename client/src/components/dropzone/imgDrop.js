import React from 'react'
import Dropzone from "react-dropzone";
import '../../styles/imgDrop.css';

function ImgDrop(props) {

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
            <img className='attach' alt='' src={require('../../img/attach.png')}></img>
            <p>Choose a file or drop it here...</p>
          </div>
        )}
      </Dropzone>
  )
}

export default ImgDrop