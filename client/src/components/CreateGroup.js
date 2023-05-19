import React from 'react'
import '../styles/createGroup.css';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ImgDrop from './dropzone/imgDrop';
import defaultImg from '../img/conv.png';

const socket = io.connect("https://messnode-backend.onrender.com:3001");

function CreateGroup(props) {
    const dataCld = props.dataCld;
    const [title, setTitle] = useState(null);
    const [file, setFile] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [pfpId, setPfpId] = useState(null);

    const onDrop = async(data, fileR) =>{
        setFileData(data);
        setFile(fileR);
    };
    const createChat = async () =>{
        if(title !== null && file !== null){
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
                console.log(err)
            });
            // setTimeout(() =>{
            //     props.toggle();
            // }, 1000)
        }else{
            alert('Please specify title and picture!');
        }
    }
    useEffect(() =>{
        if(pfpId !== null){
            var chatData = {
                title: title,
                creator: props.userId,
                pic: pfpId
            }
            socket.emit('create_new_chat', chatData);
            socket.on('chat_created', data =>{
                if(data == true) props.fetchUserInfo();
            });
        }
    },[pfpId]);
    return (
        <div className='blurBackground'>
            <div className='createGroup'>
                <div className='xClose' onClick={props.toggle}>X</div>
                <p className='convHeader'>Create a conversation</p>
                
                {file ? <img className='createImg' src={file}/> : <img className='createImg' src={defaultImg}/>}
                {/* <CloudinaryContext cloudName={dataCld.cloudName}>
                    <input type='file' onChange={e => {
                        const file = e.target.files[0];
                        if((file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')){
                            const reader = new FileReader();
                            reader.onload = () => {
                            setFile(reader.result);
                            };
                            reader.readAsDataURL(file);
                        }else{
                            e.target.value = null;
                            setFile(null);
                            alert('Image must jpg/png/gif!');
                        }
                    }}/>
                </CloudinaryContext> */}
                <input type='text' className='convName' placeholder='Conversation name...' onChange={e => setTitle(e.target.value)}/>
                <ImgDrop onDrop={onDrop}/>
                <input type='button' className='createSubmit' value='Confirm' onClick={createChat}/>
            </div>
        </div>
      )
}

export default CreateGroup