import React, { Component, useLayoutEffect, useEffect, useState, useRef } from 'react'
import '../styles/mainPage.css';

import ManageUser from '../components/ManageUser';
import AddUser from './AddUser';
import {useNavigate } from 'react-router-dom';
import LeaveGroup from './LeaveGroup';
import {CloudinaryContext, Image, ImageUploader} from 'cloudinary-react';

export default function MainPage(props) {
    const socket = props.socket;
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

    const msgContainerRef = useRef(null);

    let navigate = useNavigate()
    const dataCld = {
        cloudName: 'dbz9t4cb6',
        apiKey: '487621486735284',
        apiSecret: '5iFhTeV3myX13qcc-_llf0_lhfY'
      }

    const userData ={
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email'),
        userId: localStorage.getItem('userId'),
        pfp: localStorage.getItem('pfp')
    }
    // socket.emit("request_login_info", userData.email)
    // socket.on("receive_login_info")
    useLayoutEffect(() =>{
        fetchUserInfo();
    },[])

    useEffect(() =>{
        setToggleAddUser(false);
        if(conversationIndex !== 0){
            var convData = {
                convId: conversationIndex,
            }
            socket.emit('get_chat_data', convData);
            socket.emit('join_room', convData);
            socket.on('receive_chat_data', (data) =>{
                setMessageList(data.msgList);
                setMemberList(data.memberList);
                if(msgContainerRef.current){
                    setTimeout(() =>{
                        msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
                    }, 0)
                }
            });
        }
    }, [conversationIndex]);
    useEffect(() =>{
        socket.off('receive_message').on('receive_message', (data) =>{
            setMessageList((list) => [...list, data]);
        });
    }, [socket]);
    
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
                setSelectedConvName(data[0].title);
                setConversationList(data);
            }
        });
    }
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const fetchMoreMessages = async () =>{
        if(msgContainerRef.current.scrollTop === 0 && messageList.length > 0){
            var chatData = {
                oldestMessage: messageList[0].timestamp,
                convId: conversationIndex,
                lastMsgId: messageList[0].msgId
            }
            socket.emit('fetch_more_messages', chatData);
            socket.on('receive_more_messages', (data) =>{
                if(data.length !== 0){
                    setMessageList([...data, ...messageList]);
                    msgContainerRef.current.scrollTop = 40;
                }
            });
            
        }
    }
    const sendMessage = async () =>{
        
        if (currentMessage !== "" && conversationIndex !== "") {
            const messageData = {
                msgId: messageList.length+1,
                author: userData.username,
                content: currentMessage,
                timestamp: new Date().toISOString(),
                convId: conversationIndex,
                
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
        if(newChatName == null || newChatName == ''){
            alert(newChatName);
        }else{
            const chatData = {
                title: newChatName,
                creator: userData.userId
            }
            socket.emit('create_new_chat', chatData);
        }
        
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
                <CloudinaryContext cloudName={dataCld.cloudName}>
                    <Image publicId={userData.pfp}/>
                </CloudinaryContext>
                <button className='Logout' onClick={logout}>Logout </button>
            </div>
        </div>
        <div className='BottomPanel'>
            <div className='TopInfo'>
                <img src='https://static.thenounproject.com/png/630729-200.png' className='ChatPfp'></img>
                <div className='ChatName'>{selectedConvName}</div>
            </div>

            <div className='Chat' ref={msgContainerRef} onScroll={fetchMoreMessages}>
                {messageList.map((messageContent) =>{
                    const date = new Date(messageContent.timestamp);
                    var hours = date.getHours();
                    var minutes = date.getMinutes();
                    if(minutes < 10) minutes = '0' + minutes;
                    var clName = `message ${userData.username === messageContent.author ? "you" : "other"}`;
                    return <div className={clName} key={messageContent.msgId} >
                            <div className='message-content'>
                                <p>{messageContent.content}</p>
                            </div>
                            <div className='message-meta'>
                                <p id="author">{messageContent.author}</p>
                                <p id="time">{hours + ":" + minutes}</p>
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
                    onKeyDown={(event) => {
                        event.key === "Enter" && sendMessage();
                    }}
                    value={currentMessage}
                    >  
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
                        <Image className='memberImage' cloudName={dataCld.cloudName} publicId={content.pfp}></Image>
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
