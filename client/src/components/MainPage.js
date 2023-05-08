import React, { Component, useLayoutEffect, useEffect, useState, useRef } from 'react'
import '../styles/mainPage.css';
import ManageUser from './ManageUser';
import AddUser from './AddUser';
import {NavLink, useNavigate } from 'react-router-dom';
import LeaveGroup from './LeaveGroup';
import CreateGroup from './CreateGroup';
import userIcon from '../img/user.png';
import addNewIcon from '../img/addNew.png';
import logoutIcon from '../img/logout.png';
import emojiIcon from '../img/emoji.png';
import addMemberImg from '../img/addPerson.png';
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
    
    const msgContainerRef = useRef(null);
    const emojiCtRef = useRef(false);
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
    },[]);

    useEffect(() =>{
        setToggleAddUser(false);
        setToggleLeaveGroup(false);
        setToggleManageMember(false);
        if(conversationIndex !== 0){
            var convData = {
                convId: conversationIndex,
            }
            socket.emit('get_chat_data', convData);
            socket.emit('join_room', convData.convId);
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
        function handleClickOutside(e){
            if(emojiCtRef.current && !emojiCtRef.current.contains(e.target)){
                setEmojiActive(false);
            }
            
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () =>{
            document.removeEventListener('mousedown', handleClickOutside);
        }
    },[emojiCtRef]);
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
        socket.off('user_status_change').on('user_status_change', (data) =>{
            const index = memberList.findIndex(member => member.userId === data.userId);
            if(index !== -1){
                const updatedList = memberList.map((member, i) =>{
                    if(i === index){
                        return data;
                    }
                    return member;
                });
                setMemberList(updatedList);
            }
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
        await socket.emit('user_logout', userData.userId);
        localStorage.clear();
        navigate('/Login');
    }
    const fetchUserInfo = () =>{
        socket.emit('get_user_data', userData);
        socket.emit('join_room', userData.userId);
        socket.on('receive_user_data', (data) =>{
            if(data[0] === undefined){

            }else{
                // socket.data.userId = userData.userId
                socket.emit('assign_socket_userId', userData.userId);
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
    const convSettings = (e) =>{

    }
    const addUserToggle = () =>{
        setToggleAddUser(false);
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
                var loggedUserIsMsgAuthor = Boolean(parseInt(userData.userId) === parseInt(message.authorId));
                var clName =  loggedUserIsMsgAuthor ? "you" : "other";

                if(index === 0){
                    var sortByTime = false;
                    var diffDay = true;
                    var prevAuthorId = null;
                }else{
                    const prevMsg = messageList[index - 1];
                    const datePrevMsg = new Date(prevMsg.timestamp);
                    var dateDiff = dateCurrentMsg - datePrevMsg;
                    var inMinutes = Math.floor(dateDiff / 60_000);

                    var sortByTime = inMinutes >= 5 ? true : false;
                    var diffDay = inMinutes >= (60 * 14) ? true : false;

                    var prevAuthorId = parseInt(prevMsg.authorId);
                }
                var dateFormatDm = dateCurrentMsg.getDate() + ", " + dateCurrentMsg.toLocaleString('default', {month: 'long'});
                var hourFormat = hoursCurrent + ":" + minutesCurrent;
                
                const nextMsg = index+1 < messageList.length ? messageList[index+1] : message;
                var messageClass = "message " + (parseInt(message.authorId) !== parseInt(nextMsg.authorId) ? "spaceBetween" : "");
                
                return(
                    <div className='messageChain' key={message.msgId}>
                        { diffDay  ?
                            <p className="diffDay" key={dateFormatDm}>{dateFormatDm}</p>
                        :
                            null
                        }
                        <div className={clName}>
                            {(!loggedUserIsMsgAuthor && prevAuthorId !== message.authorId)  ?
                            // || (diffDay && !loggedUserIsMsgAuthor)
                            <>
                                <div className='author'>
                                    <div className='tooltipPfp' data-tooltip={message.authorName}>
                                    <Image className='msgImg' cloudName={dataCld.cloudName} publicId={message.authorPfp}></Image>
                                    </div>
                                </div>
                            </>
                            : 
                                <div className='emptySpace'/>
                            }
                            
                            <div className={messageClass} key={message.msgId}>
                                <div className="message-content">
                                    <div className='tooltipTime' data-tooltip={hourFormat}>{message.content}</div>
                                </div>
                                {/* {(sortByTime && (prevAuthorId === parseInt(message.authorId))) ?
                                    <span className="tooltipTime" data-tooltip={hourFormat}></span>
                                : null
                                    <p className="timeMessage">{hourFormat}</p>
                                } */}
                            </div>
                        </div>
                    </div>
                );
            }, []);
        }
    }
    return (
    <>
    {toggleAddUser && !toggleLeaveGroup && !toggleLeaveGroup ?  
        <AddUser toggle={addUserToggle} memberList={memberList} convId={conversationIndex} roomId={conversationIndex} dataCld={dataCld}></AddUser> 
            : null}
    {toggleLeaveGroup && !toggleAddUser && !toggleCreateGroup ? 
        <LeaveGroup toggle={leaveGroupToggle} convId={conversationIndex} userId={userData.userId}></LeaveGroup> 
            : null}
    {toggleCreateGroup && !toggleLeaveGroup && !toggleAddUser ? 
        <CreateGroup toggle={createGroupToggle} userId={userData.userId} dataCld={dataCld} fetchUserInfo={fetchUserInfo}> </CreateGroup> 
            : null}
    
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
                <div className='inputBar'>
                    {/* <input
                        type='submit'
                        className='addAttachment'
                        value='&#x2b;'
                        onKeyDown={(event) => {

                        }}
                    /> */}
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
                    <div className='emojiContainer' onClick={() => setEmojiActive(!emojiActive)}>
                        {emojiActive === true ?
                        <div className='emojiPicker' ref={emojiCtRef}>
                            <EmojiPicker onEmojiClick={(e) => {setCurrentMessage(currentMessage + e.emoji)}}/>
                        </div> : null}
                        <img src={emojiIcon} className='emojiIcon'></img>
                    </div>
                    
                    <input 
                        className='sendMessage'
                        type='submit'
                        onClick={sendMessage}
                        value='&#8594;'
                    />
                </div>
            </div>
        </div>
        <div className='rightPanel'>
            <div className='convSettings'>
                <Image className='topInfoPic' publicId={selectedConv.pic} cloudName={dataCld.cloudName} />
                <p className='topInfoTitle'>{selectedConv.title}</p>
                <input 
                    type='submit'
                    className='inputConvSettings'
                    value='...'
                    onClick={convSettings}
                />
            </div>
            <div className='participants'>
                {memberList.map((content) =>{
                    return <div className='member' 
                                key={content.userId}
                                onClick={e =>{
                                    setToggleManageMember((oldId) =>{
                                        return oldId == content.userId ? null : content.userId;
                                    });
                                } }
                            >
                        <div className='imageAndStatus'>
                            <Image className='memberImage' cloudName={dataCld.cloudName} publicId={content.pfp}/>
                            <div className={
                                (content.activity == 'Online') ? 
                                'Online' 
                                : (content.activity === 'Offline' ? 'Offline' : 'Custom')
                            }/>
                        </div>
                        {/* <button className='manageUser' onClick={e =>{
                            setToggleManageMember((oldId) =>{
                                return oldId == content.userId ? null : content.userId;
                            });
                        } }>...</button> */}
                        <div className='flexMember'>
                            <p className='memberUsername'>{content.username}</p>
                            <p className='memberStatus'>{content.activity}</p>
                        </div>
                        {toggleManageMember == content.userId  ? 
                            <ManageUser toggle={manageMemberToggle} memberId={content.userId} convId={conversationIndex}/>  : null }
                    </div>
                })}
            { conversationIndex !== 0 
            ?
                <div>
                    <div className='addMemberContainer' onClick={e =>{
                            if(toggleAddUser == true) setToggleAddUser(false)
                            else setToggleAddUser(true);
                        }}>
                        <img className='addMemberImg' 
                            src={addMemberImg}
                        />
                        <p className='addMemberText'>Add new user</p>
                    </div>
                    <div className='leaveGroupContainer' onClick={e =>{
                        if(toggleLeaveGroup == true) setToggleLeaveGroup(false)
                        else setToggleLeaveGroup(true);
                    }}>
                        <img className='leaveGroupImg' src={logoutIcon}/>
                        <p className='leaveGroupText'>Leave group</p>
                    </div> 
                </div>
            : null}
            </div>
        </div>
    </div>
    </>
  )
}
