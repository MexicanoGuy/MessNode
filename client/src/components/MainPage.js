import React, {useLayoutEffect, useEffect, useState, useRef } from 'react'
import '../styles/mainPage.css';
import '../styles/mainPageMobile.css';
import ManageUser from './ManageUser';
import AddUser from './AddUser';
import SettingsPage from './SettingsPage';
import {useNavigate } from 'react-router-dom';
import LeaveGroup from './LeaveGroup';
import CreateGroup from './CreateGroup';
import addNewIcon from '../img/addNew.png';
import logoutIcon from '../img/logout.png';
import convIcon from '../img/conv.png';
import emojiIcon from '../img/emoji.png';
import userIcon from '../img/pfpDefault.png';
import addMemberIcon from '../img/addPerson.png';
import sendMessageIcon from '../img/sendMessage.png';
import settingsIcon from '../img/settingsIcon.png';
import EmojiPicker from 'emoji-picker-react';
import {Image} from 'cloudinary-react';
import AttachmentDrop from './dropzone/attachmentDrop';

export default function MainPage(props) {
    const socket = props.socket;
    var isDesktop = props.isDesktop;
    const [conversationList, setConversationList] = useState([]);
    const [conversationIndex, setConversationIndex] = useState(0);
    const [selectedConv, setSelectedConv] = useState({
        convid: 0,
        title: 'Conversation',
        pic: 'conv_cga93k.jpg',
    });

    const [messageList, setMessageList] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');

    const [memberList, setMemberList] = useState([]);

    const [toggleManageMember, setToggleManageMember] = useState(null);
    const [toggleAddUser, setToggleAddUser] = useState(false);
    const [toggleLeaveGroup, setToggleLeaveGroup] = useState(false);
    const [toggleCreateGroup, setToggleCreateGroup] = useState(false);
    const [settingsToggle, setSettingsToggle] = useState(false);
    
    const msgContainerRef = useRef(null);
    const emojiCtRef = useRef(false);
    const [emojiActive, setEmojiActive] = useState(false);

    const [searchConv, setSearchConv] = useState('');
    const [searchActivated, setSearchActivated] = useState(false);

    const [fileBottomId, setFileBottomId] = useState(null);
    const [fileBottom, setFileBottom] = useState(null);

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
        const handleUpload = () =>{
            if(fileBottom !== null){
                const formData = new FormData();
                formData.append('file', fileBottom);
                formData.append('upload_preset', dataCld.uploadPreset);
                formData.append('cloud_name', dataCld.cloudName);

                fetch(`https://api.cloudinary.com/v1_1/${dataCld.cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    setFileBottomId(data.public_id);
                }).catch((err) =>{
                    // console.log(err)
                });
            }
        }
        handleUpload()
    }, [fileBottom]);
    useEffect(() =>{
        if(fileBottomId !== null){
            const messageData = {
                msgId: messageList.length+1,
                authorName: userData.username,
                authorId: userData.userId,
                authorPfp: userData.pfp,
                content: fileBottomId,
                messageType: 'image',
                timestamp: new Date().toISOString(),
                convId: conversationIndex,
                
            };
            socket.emit('send_message', messageData);
    
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
            setFileBottom(null);
            setFileBottomId(null);
        }
    }, [fileBottomId]);
    
    const onDrop = async(data, fileR) =>{
        setFileBottom(fileR);
    };

    useEffect(() =>{
        setToggleAddUser(false);
        setToggleLeaveGroup(false);
        setToggleManageMember(false);
        if(conversationIndex !== 0 && !searchActivated){
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
                messageType: 'text',
                content: currentMessage,
                timestamp: new Date().toISOString(),
                convId: conversationIndex,
                
            };
            await socket.emit('send_message', messageData);
            
            setMessageList((list) => [...list, messageData])
            setCurrentMessage("");
        }
    }
    const handleConvChange = (e, content) =>{
        setConversationIndex(content.convId);
        setSelectedConv(prevState => ({
            ...prevState,
            title: content.title,
            pic: content.pic,
        }));
    }
    const handleSearchConv = (e) =>{
        if(searchConv !== ''){
            var searchData = {
                userId: userData.userId,
                searchConv: searchConv
            }
            socket.emit('search_for_convs', searchData);
            socket.off('receive_convs').on('receive_convs', (data) =>{
                if(data !== null){
                    setConversationList(data);
                    setSelectedConv({
                        title: data[0].title,
                        pic: data[0].pic
                    });
                    setConversationIndex(data[0].convId);
                }
            });
        }else{
            fetchUserInfo();
        }
    }
    // const addUserToggle = () =>{
    //     setToggleAddUser(false);
    // }
    // const leaveGroupToggle = () =>{
    //     setToggleLeaveGroup(false);
    // }
    // const manageMemberToggle = () =>{
    //     setToggleManageMember(false);
    // }
    // const createGroupToggle = () =>{
    //     if(toggleCreateGroup === false){
    //        setToggleCreateGroup(!toggle);
    //     }
    //     else setToggleCreateGroup(false);
    // }
    const renderMessages = () =>{
        if(messageList === null){
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
                    // var sortByTime = false;
                    var diffDay = true;
                    var prevAuthorId = null;
                }else{
                    const prevMsg = messageList[index - 1];
                    const datePrevMsg = new Date(prevMsg.timestamp);
                    var dateDiff = dateCurrentMsg - datePrevMsg;
                    var inMinutes = Math.floor(dateDiff / 60_000);

                    // var sortByTime = inMinutes >= 5 ? true : false;
                    var diffDay = inMinutes >= (60 * 14) ? true : false;

                    var prevAuthorId = parseInt(prevMsg.authorId);
                }
                var dateFormatDm = dateCurrentMsg.getDate() + ", " + dateCurrentMsg.toLocaleString('default', {month: 'long'});
                var hourFormat = hoursCurrent + ":" + minutesCurrent;
                
                const nextMsg = index+1 < messageList.length ? messageList[index+1] : message;
                var messageType = message.messageType === 'image' ? 'image' : 'text';
                var messageClass = 
                    isDesktop ? "message" : "messageRes"
                    + (parseInt(message.authorId) !== parseInt(nextMsg.authorId) ? " spaceBetween" : "");

                return(
                    <div className={isDesktop ? 'messageChain' : 'messageChainRes'} key={message.msgId}>
                        { diffDay  ?
                            <p className={isDesktop ? 'diffDay' : 'diffDayRes' } key={dateFormatDm}>{dateFormatDm}</p>
                        :
                            null
                        }
                        <div className={clName}>
                            {(!loggedUserIsMsgAuthor && prevAuthorId !== message.authorId)  ?
                            // || (diffDay && !loggedUserIsMsgAuthor)
                                <div className={isDesktop ? 'author' : 'authorRes'}>
                                    <div className={isDesktop ? 'tooltipPfp' : 'tooltipPfpRes'} data-tooltip={message.authorName}>
                                        <Image 
                                            className={isDesktop ? 'msgImg' : 'msgImgRes'} 
                                            cloudName={dataCld.cloudName} 
                                            publicId={message.authorPfp}
                                        />
                                    </div>
                                </div>
                            : 
                                <div className={isDesktop ? 'emptySpace' : 'emptySpaceRes'}/>
                            }
                            {messageType === 'text' ?
                                <div className={messageClass} key={message.msgId}>
                                    <div className={isDesktop ? 'message-content' : 'message-contentRes'}>
                                        <div className={isDesktop ? 'tooltipTime' : 'tooltipTimeRes'} 
                                            data-tooltip={hourFormat}>{message.content}
                                        </div>
                                    </div>
                                {/* {(sortByTime && (prevAuthorId === parseInt(message.authorId))) ?
                                    <span className="tooltipTime" data-tooltip={hourFormat}></span>
                                : null
                                    <p className="timeMessage">{hourFormat}</p>
                                } */}
                                </div>
                            :
                                <div className={messageType}>
                                    <Image 
                                        className={(isDesktop ? 'chatImg ' : 'chatImgRes ') + clName} 
                                        cloudName={dataCld.cloudName} 
                                        publicId={message.content}
                                    />
                                </div>
                            }
                            
                        </div>
                    </div>
                );
            }, []);
        }
    }
    
    return (
    <>
    {toggleAddUser && !toggleLeaveGroup && !toggleLeaveGroup && !settingsToggle ?  
        <AddUser toggle={setToggleAddUser(!toggleAddUser)} memberList={memberList} convId={conversationIndex} roomId={conversationIndex} dataCld={dataCld}/> 
            : null}
    {toggleLeaveGroup && !toggleAddUser && !toggleCreateGroup && !settingsToggle ?
        <LeaveGroup toggle={setToggleLeaveGroup(!toggleLeaveGroup)} convId={conversationIndex} userId={userData.userId}/> 
            : null}
    {toggleCreateGroup && !toggleLeaveGroup && !toggleAddUser && !settingsToggle ?
        <CreateGroup toggle={setToggleCreateGroup(!toggleCreateGroup)} userId={userData.userId} dataCld={dataCld} fetchUserInfo={fetchUserInfo}/> 
            : null}
    {settingsToggle && !toggleAddUser && !toggleCreateGroup && !toggleManageMember ?
        <SettingsPage toggle={setSettingsToggle(!settingsToggle)}/> : null
    }
    <div className={ isDesktop ? 'containerConversationPage' : 'containerConversationPageRes'}>
        <div className={ isDesktop ? 'leftPanel' : 'leftPanelRes'}>
            <div className={ isDesktop ? 'topSearch' : 'topSearchRes'}>
                <input
                    className={ isDesktop ? 'searchInConv' : 'searchInConvRes'}
                    placeholder='search...'
                    onChange={e => { setSearchConv(e.target.value) }}
                    onBlur={e => handleSearchConv(e)}
                />        
                <img
                    src={addNewIcon}
                    className={ isDesktop ? 'addNewConv' : 'addNewConvRes'}
                    // onClick={e => {
                    //     setToggleCreateGroup(!toggleCreateGroup);
                    // }}
                />
            </div>
            <div className={ isDesktop ? 'chatList' : 'chatListRes'}>
            {conversationList.map((content) =>(
                <div 
                    className={
                        conversationIndex === content.convId
                            ? isDesktop ? 'conversationSelected' : 'conversationSelectedRes'
                            : isDesktop ? 'conversation' : 'conversationRes'
                    }
                    key={content.convId}
                    meta-index={content.convId}
                    onClick={e => handleConvChange(e, content)}
                >
                    {content.pic !== null ?
                        <Image
                            className={isDesktop ? 'convImg' : 'convImgRes'} 
                            cloudName={dataCld.cloudName}
                            publicId={content.pic}/>
                        :
                        <img src={convIcon} className={ isDesktop ? 'convImg' : 'convImgRes'} />
                    }
                    <p className={isDesktop ? 'convTitle' : 'convTitleRes'}>{content.title}</p>
                </div>
            ))}
            </div>
            <div className={isDesktop ? 'userProfile' : 'userProfileRes'}>
                {userData.pfp !== null ?
                    <Image 
                        className={isDesktop ? 'userProfileMain' : 'userProfileMainRes'} 
                        cloudName={dataCld.cloudName} 
                        publicId={userData.pfp}
                    />
                    :
                    <img src={userIcon} className={isDesktop ? 'userProfileMain' : 'userProfileMainRes'}/>
                }
                
                <p className={isDesktop ? 'userProfileUsername' : 'userProfileUsernameRes'}>
                    {userData.username}
                </p>
                <img src={settingsIcon} className={ isDesktop ? 'settingsIcon' : 'settingsIconRes'} 
                    onClick={e => setSettingsToggle(!settingsToggle)}
                />
                <img src={logoutIcon} className={ isDesktop ? 'logoutIcon' : 'logoutIconRes'} 
                    onClick={logout}/>
            </div>
        </div>
        <div className={ isDesktop ? 'bottomPanel' : 'bottomPanelRes'}>
            <div className={ isDesktop ? 'topInfo' : 'topInfoRes'}>
                {selectedConv.pic !== null ?
                    <Image 
                        className={isDesktop ? 'topInfoPic' : 'topInfoPicRes'} 
                        publicId={selectedConv.pic} 
                        cloudName={dataCld.cloudName}
                    />
                    :
                    <img src={convIcon} className={isDesktop ? 'topInfoPic' : 'topInfoPicRes'}/>
                }
                <p className={ isDesktop ? 'topInfoTitle' : 'topInfoTitleRes'}>{selectedConv.title}</p> 
            </div>
            <div className={ isDesktop ? 'chat' : 'chatRes'} ref={msgContainerRef} onScroll={fetchMoreMessages}>
                <div className={ isDesktop ? 'chatBeginning' : 'chatBeginningRes'}>
                    {selectedConv.pic !== null ? 
                        <Image
                            className={ isDesktop ? 'topInfoPic' : 'topInfoPicRes'} 
                            publicId={selectedConv.pic} 
                            cloudName={dataCld.cloudName}
                        />
                        :
                        <img src={convIcon} alt='imgErr' className={ isDesktop ? 'topInfoPic' : 'topInfoPicRes'}/>
                    }
                    <p className={ isDesktop ? 'beginTitle' : 'beginTitleRes'}>
                        <b>{selectedConv.title}</b>
                    </p> 
                    <p className={ isDesktop ? 'beginText' : 'beginTextRes'}>This is the beginning of the chat...</p>
                </div>
                {
                    renderMessages()
                }
            </div>
            
            <div className={ isDesktop ? 'bottomOptions' : 'bottomOptionsRes'}>
                <div className={ isDesktop ? 'inputBar' : 'inputBarRes'}>
                    <AttachmentDrop onDrop={onDrop} isDesktop={isDesktop}/>
                    <input
                        type='text' 
                        className={ isDesktop ? 'inputMessage' : 'inputMessageRes'} 
                        placeholder='Type here...'
                        onChange={e => setCurrentMessage(e.target.value)}
                        onKeyDown={(event) => {
                            event.key === "Enter" && sendMessage();
                        }}
                        value={currentMessage}
                    />
                    <div 
                        className={ isDesktop ? 'emojiContainer' : 'emojiContainerRes'} 
                    >
                        {emojiActive === true ?
                        <div className={ isDesktop ? 'emojiPicker' : 'emojiPickerRes'} ref={emojiCtRef}>
                            <EmojiPicker onEmojiClick={(e) => {setCurrentMessage(currentMessage + e.emoji)}}/>
                        </div> 
                        : null}
                        <img 
                            src={emojiIcon} 
                            className={ isDesktop ? 'emojiIcon' : 'emojiIconRes'}
                            onClick={e => setEmojiActive(!emojiActive)}
                        />
                    </div>
                    <img
                        src={sendMessageIcon}
                        className={ isDesktop ? 'sendMessage' : 'sendMessageRes'}
                        onClick={sendMessage}
                    />
                </div>
            </div>
        </div>
        <div className={ isDesktop ? 'rightPanel' : 'rightPanel'}>
            <div className={ isDesktop ? 'convSettings' : 'convSettingsRes'}>
                {selectedConv.pic !== null ? 
                <Image 
                    className={ isDesktop ? 'topInfoPic' : 'topInfoPicRes'}
                    publicId={selectedConv.pic}
                    cloudName={dataCld.cloudName}
                />
                    :
                <img src={convIcon} className={ isDesktop ? 'topInfoPic' : 'topInfoPicRes'}/>
                }
                <p className={ isDesktop ? 'topInfoTitle' : 'topInfoTitleRes'}>{selectedConv.title}</p>
                {/* <input 
                    type='submit'
                    className={ isDesktop ? 'inputConvSettings' : 'inputConvSettingsRes'}
                    value='...'
                    onClick={convSettings}
                /> */}
            </div>
            <div className={ isDesktop ? 'participants' : 'participantsRes'}>
                {memberList.map((content) =>{
                    return <div className={ isDesktop ? 'member' : 'memberRes'} 
                                key={content.userId}
                                onClick={e =>{
                                    setToggleManageMember((oldId) =>{
                                        return oldId === content.userId ? null : content.userId;
                                    });
                                } }
                            >
                        <div className={ isDesktop ? 'imageAndStatus' : 'imageAndStatusRes'}>
                            { content.pfp !== '' ?
                            <Image 
                                className={ isDesktop ? 'memberImage' : 'memberImageRes'}
                                cloudName={dataCld.cloudName}
                                publicId={content.pfp}
                            />
                            :
                                <img src={userIcon} className={ isDesktop ? 'memberImage' : 'memberImageRes'}/>
                            }
                            <div className={
                                (content.activity === 'Online') ? 
                                'Online'
                                : (content.activity === 'Offline' ? 'Offline' : 'Custom')
                            }/>
                        </div>
                        {/* <button className='manageUser' onClick={e =>{
                            setToggleManageMember((oldId) =>{
                                return oldId == content.userId ? null : content.userId;
                            });
                        } }>...</button> */}
                        <div className={ isDesktop ? 'flexMember' : 'flexMemberRes'}>
                            <p className={ isDesktop ? 'memberUsername' : 'memberUsernameRes'}>{content.username}</p>
                            <p className={ isDesktop ? 'memberStatus' : 'memberStatusRes'}>{content.activity}</p>
                        </div>
                        {toggleManageMember === content.userId  ? 
                            <ManageUser toggle={setToggleManageMember(!toggleManageMember)} memberId={content.userId} convId={conversationIndex}/>  : null }
                    </div>
                })}
            { conversationIndex !== 0 
            ?
                <div>
                    <div className={ isDesktop ? 'addMemberContainer' : 'addMemberContainerRes'} 
                        onClick={e =>{ setToggleAddUser(!toggleAddUser)}}>
                        <img className={ isDesktop ? 'addMemberImg' : 'addMemberImgRes'}
                            src={addMemberIcon}
                        />
                        <p className={ isDesktop ? 'addMemberText' : 'addMemberTextRes'}>Add new user</p>
                    </div>
                    <div className={ isDesktop ? 'leaveGroupContainer' : 'leaveGroupContainerRes'} onClick={e =>{
                        setToggleLeaveGroup(!toggleLeaveGroup)}}>
                        <img className={ isDesktop ? 'leaveGroupImg' : 'leaveGroupImgRes'} src={logoutIcon}/>
                        <p className={ isDesktop ? 'leaveGroupText' : 'leaveGroupTextRes'}>Leave group</p>
                    </div> 
                </div>
            : null}
            </div>
        </div>
    </div>
    </>
  )
}
