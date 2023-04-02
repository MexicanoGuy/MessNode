import React, { Component, useLayoutEffect, useEffect, useState, useRef } from 'react'
import '../styles/secondPage.css';
import ManageUser from './ManageUser';
import AddUser from './AddUser';
import {useNavigate } from 'react-router-dom';
import LeaveGroup from './LeaveGroup';
import CreateGroup from './CreateGroup';
import userIcon from '../img/user.png';
import addNewIcon from '../img/addNew.png';
import logoutIcon from '../img/logout.png';

import {CloudinaryContext, Image, ImageUploader} from 'cloudinary-react';

export default function MainPage(props) {
    const socket = props.socket;
    
    const [conversationList, setConversationList] = useState([]);
    const [conversationIndex, setConversationIndex] = useState(0);
    const [selectedConv, setSelectedConv] = useState({
        title: 'Conversation',
        pic: 'conv_cga93k.jpg',
    });

    const [messageList, setMessageList] = useState([]);
    const [guiMessageList, setguiMessageList] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');

    const [memberList, setMemberList] = useState([]);

    const [toggleManageMember, setToggleManageMember] = useState(null);
    const [toggleAddUser, setToggleAddUser] = useState(false);
    const [toggleLeaveGroup, setToggleLeaveGroup] = useState(false);
    const [toggleCreateGroup, setToggleCreateGroup] = useState(false);
    
    const [lastMsgName, setLastMsgName] = useState(null);
    const msgContainerRef = useRef(null);

    let navigate = useNavigate()
    // const dataCld = {
    //     cloudName: 'dbz9t4cb6',
    //     apiKey: '487621486735284',
    //     apiSecret: '5iFhTeV3myX13qcc-_llf0_lhfY',
    //     uploadPreset: 'r1l3esxv'
    //   }
    const dataCld = {
        cloudName: process.env.REACT_APP_CNAME,
        apiKey: process.env.REACT_APP_CAPIKEY,
        apiSecret: process.env.REACT_APP_CSECRET,
        uploadPreset: process.env.REACT_APP_CUPLOAD_PRESET
    }

    const userData ={
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email'),
        userId: localStorage.getItem('userId'),
        pfp: localStorage.getItem('pfp')
    }
    useLayoutEffect(() =>{
        fetchUserInfo();
    },[])

    useEffect(() =>{
        setToggleAddUser(false);
        setToggleLeaveGroup(false);
        setToggleManageMember(false);
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
        socket.off('added_to_conv').on('added_to_conv', (data) =>{
            fetchUserInfo();
        });
        socket.off('you_were_kicked').on('you_were_kicked', (data) =>{
            fetchUserInfo();
            alert('You were kicked from the conversation!');
        });
    }, [socket]);

    useEffect(() =>{
        socket.off('member_added').on('member_added', (data) =>{
            setMemberList((list) => [...list, data]);
        });
        socket.off('member_kicked').on('member_kicked', (data) =>{
            const filteredList = memberList.filter(member => parseInt(member.userId) !== parseInt(data));
            setMemberList(filteredList);
        });
      }, [memberList]);

    useEffect(() =>{
        socket.off('remove_the_group').on('remove_the_group', (data) =>{
            const filteredList = conversationList.filter(conv => conv.convId !== data);
            setConversationList(filteredList);
            if(conversationList.length > 0){
                setConversationIndex(1);
            }
        });
    }, [conversationList]);

    useEffect(() =>{
        socket.off('receive_message').on('receive_message', (data) =>{
            setMessageList((list) => [...list, data]);
        });
        
    }, [messageList]);


    const logout = async () =>{
        localStorage.clear();
        navigate('/Login');
    }
    const fetchUserInfo = () =>{
        socket.emit('get_user_data', userData);
        socket.on('receive_user_data', (data) =>{
            if(data[0] === undefined){

            }else{
                setConversationIndex(data[0].convId);
                setSelectedConv(prevState => ({
                    ...prevState,
                    title: data[0].title,
                    pic: data[0].pic
                }));
                setConversationList(data);
            }
        });
    }
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

    const handleConvChange = (e, content) =>{
        setConversationIndex(content.convId);
        setSelectedConv(prevState => ({
            ...prevState,
            title: content.title,
            pic: content.pic,
        }));
    }
    
    const leaveGroupToggle = () =>{
        setToggleLeaveGroup(false);
    }
    const manageMemberToggle = () =>{
        setToggleManageMember(false);
    }
    const createGroupToggle = () =>{
        if(toggleCreateGroup == false){
           setToggleCreateGroup(true);
        }
        else setToggleCreateGroup(false);
    }
    const loadMessages = () =>{
        if(messageList == null){
            return null;
        }else{
            return messageList.map((message, index) =>{
                const dateCurrentMsg = new Date(message.timestamp);
                var hours = dateCurrentMsg.getHours();
                var minutes = dateCurrentMsg.getMinutes();
                if(minutes < 10) minutes = '0' + minutes;
                var clName = `message ${userData.username === message.author ? "you" : "other"}`;
                
                if(index === 0){
                    return (
                    <div key={message.msgId}>
                        <div className='author'>{message.author}</div>
                        <div className={clName} >
                            <div className='message-content'>
                                <p>{message.content}</p>
                            </div>
                            <span id="time">{hours + ":" + minutes}</span>
                        </div>
                    </div>);
                }
                else{
                    const prevMsg = messageList[index - 1];
                    const datePrevMsg = new Date(prevMsg.timestamp);
                    var isMinuteSame = (dateCurrentMsg - datePrevMsg);

                    console.log(isMinuteSame)
                    if(prevMsg.author === message.author){
                        return(
                        <div className={clName} key={message.msgId}>
                            <div className='message-content'>
                                <p>{message.content}</p>
                            </div>
                            <span id="time">{hours + ":" + minutes}</span>
                        </div>
                        );
                    }else{
                        return(
                        <div key={message.msgId}>
                            <div className='author'>{message.author}</div>
                            <div className={clName}>
                                <div className='message-content'>
                                    <p>{message.content}</p>
                                </div>
                            </div>
                            <span id="time">{hours + ":" + minutes}</span>
                        </div>);
                    }
                }
                
            }, []);
        }
        
    }
    return (
    <>
    {toggleAddUser && !toggleLeaveGroup && !toggleLeaveGroup ?  <AddUser memberList={memberList} convId={conversationIndex} roomId={conversationIndex}></AddUser> : <></>}
    {toggleLeaveGroup && !toggleAddUser && !toggleCreateGroup ? <LeaveGroup toggle={leaveGroupToggle} convId={conversationIndex} userId={userData.userId}></LeaveGroup> : <></>}
    {toggleCreateGroup && !toggleLeaveGroup && !toggleAddUser ? <CreateGroup toggle={createGroupToggle} userId={userData.userId} dataCld={dataCld} fetchUserInfo={fetchUserInfo}> </CreateGroup> : <></>}
    
    <div className='containerConversationPage'>
        <div className='leftPanel'>
            <div className='topSearch'>
                <input
                    className='searchInConv'
                    placeholder='search...'
                />        
                <img
                    src={addNewIcon}
                    className='addNewConv'
                    onClick={e => {
                        createGroupToggle();
                    }}
                />
            </div>
            <div className='chatList'>
            {conversationList.map((content) =>(
                <div 
                    className={
                        conversationIndex === content.convId
                            ? 'conversationSelected'
                            : 'conversation'
                    }
                    key={content.convId}
                    meta-index={content.convId}
                    onClick={e => handleConvChange(e, content)}
                >
                    <Image className='convImg' cloudName={dataCld.cloudName} publicId={content.pic}/>
                    <p className='convTitle'>{content.title}</p>
                </div>
            ))
            }
            </div>
            <div className='userProfile'>
                <Image className='userProfileMain' cloudName={dataCld.cloudName} publicId={userData.pfp}/>
                <p className='userProfileUsername'>{userData.username}</p>
                <img src={logoutIcon} className='logoutIcon' onClick={logout}/>
            </div>
        </div>
        <div className='bottomPanel'>
            <div className='topInfo'>
                <Image className='topInfoPic' publicId={selectedConv.pic} cloudName={dataCld.cloudName} />
                <p className='topInfoTitle'>{selectedConv.title}</p> 
            </div>

            <div className='chat' ref={msgContainerRef} onScroll={fetchMoreMessages}>
                {
                    loadMessages()
                    
                }
                {/* {messageList.map((messageContent, lastAuthor) =>{
                    const date = new Date(messageContent.timestamp);
                    var hours = date.getHours();
                    var minutes = date.getMinutes();
                    if(minutes < 10) minutes = '0' + minutes;
                    var clName = `message ${userData.username === messageContent.author ? "you" : "other"}`;

                    if(lastAuthor === messageContent.author){

                    }else{
                        return <div className={clName} key={messageContent.msgId}>
                            <div className='message-content'>
                                <p>{messageContent.content}</p>
                            </div>
                            <div className='message-meta'>
                                <p id="author">{messageContent.author}</p>
                                <span id="time">{hours + ":" + minutes}</span>
                            </div>
                        </div>
                    }
                })}  */}
            </div>
            
            <div className='bottomButtons'>
                <input 
                    type='text' 
                    className='inputMessage' 
                    placeholder='Type here...'
                    onChange={e => setCurrentMessage(e.target.value)}
                    onKeyDown={(event) => {
                        event.key === "Enter" && sendMessage();
                    }}
                    value={currentMessage}
                    >  
                    </input>
                <button 
                    className='sendMessage' 
                    onClick={sendMessage}
                    >&#8594;
                </button>
            </div>
        </div> {/*Chat Window*/}
        <div className='rightPanel'>
            <div className='participants'>
                {memberList.map((content) =>{
                    return <div className='member' key={content.userId}>
                        <Image className='memberImage' cloudName={dataCld.cloudName} publicId={content.pfp}></Image>
                        <button className='manageUser' onClick={e =>{
                            setToggleManageMember((oldId) =>{
                                return oldId == content.userId ? null : content.userId;
                            });
                        } }>...</button>
                        <div className='flexMember'>
                            <p className='memberUsername'>{content.username}</p>
                            <p className='memberStatus'>Online</p>
                        </div>
                        {toggleManageMember == content.userId  ? <ManageUser toggle={manageMemberToggle} memberId={content.userId} convId={conversationIndex}></ManageUser>  : '' }
                        
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
