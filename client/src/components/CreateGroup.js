import React from 'react'
import '../styles/manageUser.css';
import { useState, useEffect, useLayoutEffect } from 'react';
import { io } from 'socket.io-client';
import {CloudinaryContext, Image, ImageUploader} from 'cloudinary-react';

const socket = io.connect("localhost:3001");

function CreateGroup(props) {
    const dataCld = props.dataCld;
    const [title, setTitle] = useState(null);
    const [file, setFile] = useState(null);
    const [pfpId, setPfpId] = useState(null);

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
        }
    },[pfpId]);
    return (
        <div className='container'>
            <h2>Create new conversation!</h2> <br></br>
            <input type='text' placeholder='Conversation name...' onChange={e => setTitle(e.target.value)}></input>
            <CloudinaryContext cloudName={dataCld.cloudName}>
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
              </CloudinaryContext>
            <input type='button' value='Confirm' onClick={createChat}></input>
        </div>
      )
}

export default CreateGroup