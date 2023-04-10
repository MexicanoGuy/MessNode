import React, { Component, useLayoutEffect, useEffect, useState, useRef } from 'react'
import '../styles/secondPage.css';
import ManageUser from './ManageUser';
import AddUser from './AddUser';
import {NavLink, useNavigate } from 'react-router-dom';
import LeaveGroup from './LeaveGroup';
import CreateGroup from './CreateGroup';

import userIcon from '../img/user.png';
import addNewIcon from '../img/addNew.png';
import logoutIcon from '../img/logout.png';
import emojiIcon from '../img/emoji.png';

import EmojiPicker from 'emoji-picker-react';

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

    const [emojiActive, setEmojiActive] = useState(false);

    let navigate = useNavigate()
    
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
                if(data.length !== 0 && data !== false){
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
                authorName: userData.username,
                authorId: userData.userId,
                authorPfp: userData.pfp,
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
    const renderMessages = () =>{
        if(messageList == null){
            return null;
        }else{
            return messageList.map((message, index) =>{
                const dateCurrentMsg = new Date(message.timestamp);
                var hoursCurrent = dateCurrentMsg.getHours();
                var minutesCurrent = dateCurrentMsg.getMinutes();
                if(minutesCurrent < 10) minutesCurrent = '0' + minutesCurrent;
                var clName = `${parseInt(userData.userId) === parseInt(message.authorId) ? "you" : "other"}`;
                    
                if(index === 0){
                    var sortByTime = false;
                    var diffDay = true;
                    var prevAuthorId = null;
                }else{
                    const prevMsg = messageList[index - 1];
                    const datePrevMsg = new Date(prevMsg.timestamp);
                    var dateDiff = dateCurrentMsg - datePrevMsg;
                    var inMinutes = Math.floor(dateDiff / 60_000);

                    var sortByTime = inMinutes <= 5 ? true : false;
                    var diffDay = inMinutes >= (60*24) ? true : false;

                    var prevAuthorId = parseInt(prevMsg.authorId);
                }
                var dateFormatDm = dateCurrentMsg.getDate() + ", " + dateCurrentMsg.toLocaleString('default', {month: 'long'});
                var hourFormat = hoursCurrent + ":" + minutesCurrent;

                return(
                    <div className='messageGroup' key={message.msgId}>
                        
                        { diffDay ?
                            <span className="spanNewDay" key={dateFormatDm}>{dateFormatDm}</span>
                        :
                            null
                        }
                        <div className={clName}>
                            {prevAuthorId === parseInt(message.authorId) ?
                                null
                            : 
                            <>
                                <div className='author'>
                                    <Image className='msgImg' cloudName={dataCld.cloudName} publicId={message.authorPfp}></Image>
                                    {message.authorName}
                                </div>
                            </>}
                            <div className='message' key={message.msgId}>
                                <div className='message-content'>
                                    <p>{message.content}</p>
                                </div>
                                {(sortByTime && (prevAuthorId === parseInt(message.authorId))) ?
                                    <span className="tooltipTime">{hourFormat}</span>
                                : <span className="timeMessage">{hourFormat}</span>
                                }
                            </div>
                        </div>
                    </div>
                );
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
            ))}
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
                <div className='chatBeginning'>
                    <Image className='topInfoPic' publicId={selectedConv.pic} cloudName={dataCld.cloudName} />
                    <p className='beginTitle'><b>{selectedConv.title}</b></p> 
                    <p className='beginText'>This is the beginning of the chat...</p>
                </div>
                {
                    renderMessages()
                }
            </div>
            
            <div className='bottomOptions'>
                <input 
                    type='text' 
                    className='inputMessage' 
                    placeholder='Type here...'
                    onChange={e => setCurrentMessage(e.target.value)}
                    onKeyDown={(event) => {
                        event.key === "Enter" && sendMessage();
                    }}
                    value={currentMessage}
                />
                <div className='emojiContainer'>
                    {emojiActive === true ? 
                    <div className='emojiPicker'>
                        <EmojiPicker onEmojiClick={(e) => {setCurrentMessage(currentMessage + e.emoji)}}/>
                    </div>
                    : null}
                    <div onClick={() => setEmojiActive(!emojiActive)}>
                        <img src={emojiIcon} className='emojiIcon'></img>
                    </div>
                </div>
                
                <input 
                    className='sendMessage' 
                    onClick={sendMessage}
                    defaultValue='&#8594;'
                />
            </div>
        </div>
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
