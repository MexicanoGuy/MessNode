import React, { Component, useLayoutEffect, useEffect, useState } from 'react'
import '../styles/mainPage.css';
//import {useState, useEffect} from 'react';

//import {Link, useNavigate} from 'react-router-dom';
import io from 'socket.io-client';


const socket = io.connect("localhost:3001");

export default function MainPage() {
    const [newChatName, setNewChatName] = useState('');
    
    const [conversationList, setConversationList] = useState([]);
    const [conversationIndex, setConversationIndex] = useState(0);
    
    const [messageList, setMessageList] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');

    const [memberList, setMemberList] = useState([]);

    const userData ={
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email')
    }
    useLayoutEffect(() =>{
        fetchUserInfo();
    },[])
    useEffect(() =>{
        if(conversationIndex !== 0)
        socket.emit('get_chat_data', conversationIndex);
        socket.on('receive_chat_data', (data) =>{
            setMessageList(data.msgList);
            setMemberList(data.memberList);
            // console.log(data.memberList);
        })  
    }, [conversationIndex])
    const fetchUserInfo = () =>{
        socket.emit('get_user_data', userData);
        socket.on('receive_user_data', (data) =>{
            var firstConv = data[0].convId;
            setConversationIndex(firstConv);
            setConversationList(data);
        })
    }
    const sendMessage = async () =>{
        
        if (currentMessage !== "" && conversationIndex !== "") {
            const messageData = {
                //room: room,
                author: userData.username,
                message: currentMessage,
                time:
                    new Date(Date.now()).getHours() +
                    ":" +
                    new Date(Date.now()).getMinutes() +
                    ":" + 
                    new Date(Date.now()).getSeconds(),
                convNo: conversationIndex,
                
            };
            await socket.emit('send_message', messageData);
            
            setMessageList((list) => [...list, messageData])
            setCurrentMessage("");
        }
    };

    const handleConvChange = (e,convId) =>{
        setConversationIndex(convId);
    }
    const createNewChat = async () => {
        if(newChatName == null || newChatName == '') alert(newChatName);
        const chatData = {
            title: newChatName,
            creator: userData.username
        }
        socket.emit('create_new_chat', chatData);
    }
    return (
    <>
    <div className='Container'>
        <div className='LeftPanel'>
            <p className='ChatsLabel'>Chats</p>
            <input 
                type='search' 
                placeholder='search or create chat...' 
                className='SearchInput'
                onChange={(event) =>{
                    setNewChatName(event.target.value);
                }}
            ></input>
            <button className='searchForChat'>search</button>
            <button 
                className='createNewChatBtn'
                onClick={createNewChat}
            >create</button>
            <div className='ChatList'>
            {conversationList.map((content) =>(
                 <div 
                    className={
                        conversationIndex === content.convId
                            ? 'conversationSelected'
                            : 'conversation'
                    }
                    key={content.convId}
                    meta-index={content.convId}
                    onClick={e => handleConvChange(e, content.convId)}>
                    <div className='convImg' ></div>
                    <p className='conversationTitle'>{content.title}</p>
                    <p className='lastMessage'></p>
                 </div>
            ))
            }
            </div>
            <div className='UserProfile'>Welcome back {userData.username}</div>
        </div> {/*Groups window */}
        <div className='BottomPanel'>
            <div className='TopInfo'>
                <img src='https://static.thenounproject.com/png/630729-200.png' className='ChatPfp'></img>
                <div className='ChatName'>{}</div>
            </div>
            <div className='Chat'>
                {messageList.map((messageContent) =>{
                    //console.log(messageContent);
                    return <div className='message' key={messageContent.msgId} id={userData.username === messageContent.author ? "you" : "other"}>
                        <div>
                            <div className='message-content'>
                                <p>{messageContent.content}</p>
                            </div>
                            <div className='message-meta'>
                                <p id="author">{messageContent.author}</p>
                                <p id="time">{messageContent.timestamp}</p>
                            </div>
                        </div>
                        
                    </div>
                })}
            </div>
            <div className='BottomButtons'>
                <input 
                    type='text' 
                    className='InputMessage' 
                    placeholder='type here...'
                    onChange={e => setCurrentMessage(e.target.value)}
                    onKeyPress={(event) => {
                        event.key === "Enter" && sendMessage();
                    }}>  
                    </input>
                <button 
                    className='SendMessage' 
                    onClick={sendMessage}
                    > &#8594;
                </button>
            </div>
        </div> {/*Chat Window*/}
        <div className='RightPanel'>
            {/* <input type='text' className='AddMember' placeholder='Add member...'></input> */}
            <div className='Participants'>
                {memberList.map((content) =>{
                    return <div className='Member' key={content.userId}>
                        <img className='memberImage' src="https://i.pinimg.com/550x/20/0d/72/200d72a18492cf3d7adac8a914ef3520.jpg"></img >
                        <div className='flexMember'>
                            <p className='memberUsername'>{content.username}</p>
                            <p className='memberStatus'>Online</p>
                        </div>
                    </div>
                })}  
            </div>
        </div> {/*For Media*/}
    </div>
    </>
  )
}
