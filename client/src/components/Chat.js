import React,{useEffect, useState} from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';


function Chat({socket, username, room}) {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [userList, setUserList] = useState([]);

    const leaveRoom = () =>{
        
    }
    const sendMessage = async () =>{
        
        if (currentMessage !== "") {
            const messageData = {
              room: room,
              author: username,
              message: currentMessage,
              time:
                new Date(Date.now()).getHours() +
                ":" +
                new Date(Date.now()).getMinutes(),
            };
            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData])
            setCurrentMessage("");
        }
    };

    useEffect(() => {
        socket.on("receive_message", (data) =>{
            setMessageList((list) => [...list, data]);
        });
        socket.on("userlist_change", (data) =>{
            //setUsersList(data);
            console.log("userlist change:");
            console.log(data);
            setUserList((list) => [...list, data.username]);
            console.log(userList);
        });
    }, [socket]);

    return (
    <>
    <div className='flex-container'>
        <div className='chat-users'>
            <p id='chat-active-users'>Active users:</p>

        </div>
        <div className='chat-window'>
        

        <div className='chat-header'>
            <h1>Chatting in room: {room}</h1>
        </div>
        
        <div className='chat-body'>
            <ScrollToBottom className='message-container'>
            {messageList.map((messageContent) =>{
                return <div className='message' key={messageContent.message.toString()} id={username === messageContent.author ? "you" : "other"}>
                    <div>
                        <div className='message-content'>
                            <p>{messageContent.message}</p>
                        </div>
                        <div className='message-meta'>
                            <p id="author">{messageContent.author}</p>
                            <p id="time">{messageContent.time}</p>
                        </div>
                    </div>
                    
                </div>
            })}
            </ScrollToBottom>
        </div>
        
        <div className='chat-footer'>
            <input
                className='message-text'
                type='text'
                value={currentMessage}
                placeholder="Type here..."
                onChange={(event) => {
                    setCurrentMessage(event.target.value);
                }}
                onKeyPress={(event) => {
                    event.key === "Enter" && sendMessage();
                }}
                >
            </input>
            
            <button 
                onClick={sendMessage}
                className='send-message'
            ><p>&#8594;</p></button>
        </div>
        </div>
    </div>
    
    </>
  )
}

export default Chat