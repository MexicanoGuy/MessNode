import React from 'react'
import Dropzone from "react-dropzone";
import '../../styles/imgDrop.css';
import '../../styles/imgDropMobile.css';

function ImgDrop(props) {
  var isDesktop = props.isDesktop;
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
          <div className={isDesktop ? 'drop' : 'dropRes'} {...getRootProps()}>
            <input {...getInputProps()}/>
            <img className={ isDesktop ? 'attach' : 'attachRes'} src={require('../../img/attach.png')}></img>
            <p>Choose an image or drop it here...</p>
          </div>
        )}
      </Dropzone>
  );
}

export default ImgDrop