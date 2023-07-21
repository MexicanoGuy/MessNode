import React from 'react'
import Dropzone from "react-dropzone";
import '../../styles/attachmentDrop.css';
// import '../../styles/attachmentDropMobile.css';

function AttachmentDrop(props) {
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
          <div className={isDesktop ? 'dropAttachment' : 'dropAttachmentRes'} {...getRootProps()}>
            <input {...getInputProps()}/>
            <img className={ isDesktop ? 'attachFile' : 'attachFileRes'} src={require('../../img/sendImg.png')}/>
          </div>
        )}
      </Dropzone>
  );
}

export default AttachmentDrop