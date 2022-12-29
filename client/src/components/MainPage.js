import React, { Component, useLayoutEffect, useEffect, useState } from 'react'
import '../styles/mainPage.css';
//import {useState, useEffect} from 'react';

//import {Link, useNavigate} from 'react-router-dom';
import io from 'socket.io-client';
import ManageUser from '../components/ManageUser';
import AddUser from './AddUser';
import { Link, useNavigate, NavLink, Route } from 'react-router-dom';
import LeaveGroup from './LeaveGroup';

const socket = io.connect("localhost:3001");

export default function MainPage() {
    const [newChatName, setNewChatName] = useState('');
    
    const [conversationList, setConversationList] = useState([]);
    const [conversationIndex, setConversationIndex] = useState(0);
    const [selectedConvName, setSelectedConvName] = useState('');

    const [messageList, setMessageList] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');

    const [memberList, setMemberList] = useState([]);

    const [toggleManageUser, setToggleManageUser] = useState(null);
    const [toggleAddUser, setToggleAddUser] = useState(false);
    const [toggleLeaveGroup, setToggleLeaveGroup] = useState(false);
    let navigate = useNavigate()
    
    const userData ={
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email'),
        userId: localStorage.getItem('userId')
    }
    useLayoutEffect(() =>{
        fetchUserInfo();
    },[])
    useEffect(() =>{
        setToggleAddUser(false);
        if(conversationIndex !== 0)
        socket.emit('get_chat_data', conversationIndex);
        socket.on('receive_chat_data', (data) =>{
            setMessageList(data.msgList);
            setMemberList(data.memberList);
            // console.log(data.memberList);
        })  
    }, [conversationIndex])
    const logout = async () =>{
        localStorage.clear();
        navigate('/Login');
    }
    const fetchUserInfo = () =>{
        socket.emit('get_user_data', userData);
        socket.on('receive_user_data', (data) =>{
            if(data[0] === undefined){

            }else{
                var firstConv = data[0].convId;
                setConversationIndex(firstConv);
                tellOthers();
                setSelectedConvName(data[0].title);
                setConversationList(data);
            }
        });
    }
    const tellOthers = () =>{
        socket.emit('new')
    }
    const sendMessage = async () =>{
        
        if (currentMessage !== "" && conversationIndex !== "") {
            const messageData = {
                //room: room,
                msgId: messageList.length+1,
                author: userData.username,
                message: currentMessage,
                timestamp: new Date().toISOString(),
                    // new Date(Date.now()).getHours() +
                    // ":" +
                    // new Date(Date.now()).getMinutes() +
                    // ":" + 
                    // new Date(Date.now()).getSeconds(),
                convNo: conversationIndex,
                
            };
            await socket.emit('send_message', messageData);
            
            setMessageList((list) => [...list, messageData])
            setCurrentMessage("");
        }
    };

    const handleConvChange = (e,convId, title) =>{
        setConversationIndex(convId);
        setSelectedConvName(title);
    }
    const createNewChat = async () => {
        if(newChatName == null || newChatName == '') alert(newChatName);
        const chatData = {
            title: newChatName,
            creator: userData.userId
        }
        socket.emit('create_new_chat', chatData);
    }
    
    const leaveGroupToggle = () =>{
        setToggleLeaveGroup(false);
    }
    return (
    <>
    {toggleAddUser && !toggleLeaveGroup ?  <AddUser memberList={memberList} convId={conversationIndex}></AddUser> : <></>}
    {toggleLeaveGroup && !toggleAddUser ? <LeaveGroup toggle={leaveGroupToggle} convId={conversationIndex} userId={userData.userId}></LeaveGroup> : <></>}
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
            <button 
                className='searchForChat'>search
            </button>
            <button 
                className='createNewChatBtn'
                onClick={createNewChat}>create
            </button>
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
                    onClick={e => handleConvChange(e, content.convId, content.title)}>
                    <div className='convImg' ></div>
                    <p className='conversationTitle'>{content.title}</p>
                    <p className='lastMessage'></p>
                 </div>
            ))
            }
            </div>
            <div className='UserProfile'>
                <p>Welcome back {userData.username}</p>
                <button className='Logout' onClick={logout}>Logout </button>
            </div>
        </div> {/*Groups window */}
        <div className='BottomPanel'>
            <div className='TopInfo'>
                <img src='https://static.thenounproject.com/png/630729-200.png' className='ChatPfp'></img>
                <div className='ChatName'>{selectedConvName}</div>
            </div>
            <div className='Chat'>
                {messageList.map((messageContent) =>{
                    const date = new Date(messageContent.timestamp);
                    var hours = date.getHours();
                    var minutes = date.getMinutes();
                    return <div className='message' key={messageContent.msgId} id={userData.username === messageContent.author ? "you" : "other"}>
                        <div>
                            <div className='message-content'>
                                <p>{messageContent.content}</p>
                            </div>
                            <div className='message-meta'>
                                <p id="author">{messageContent.author}</p>
                                <p id="time">{hours + ":" + minutes}</p>
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
                        <button className='manageUser' onClick={e =>{
                            setToggleManageUser((oldId) =>{
                                return oldId == content.userId ? null : content.userId;
                            });
                        } }>...</button>
                        <div className='flexMember'>
                            <p className='memberUsername'>{content.username}</p>
                            <p className='memberStatus'>Online</p>
                        </div>
                        {toggleManageUser == content.userId  ? <ManageUser memberId={content.userId} convId={conversationIndex}></ManageUser>  : '' }
                        
                    </div>
                })}
            { conversationIndex !== 0 
            ?
                <><button className='addMemberContainer' onClick={e =>{
                    if(toggleAddUser == true) setToggleAddUser(false)
                    else setToggleAddUser(true);
                }}>
                <div className='addNewMemberBtn'>&#10010;</div> <a className='addMemberA'>Add new user</a> 
                </button>
                <button className='leaveGroupContainer' onClick={e =>{
                    if(toggleLeaveGroup == true) setToggleLeaveGroup(false)
                    else setToggleLeaveGroup(true);
                }}>
                    <div className='leaveGroup'>&#10149;</div> <a className='leaveGroupA'>Leave group</a> 
                </button> </>
            : <></>}
            </div>
        </div>
    </div>
    </>
  )
}
