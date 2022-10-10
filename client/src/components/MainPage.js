import React from 'react'
import '../styles/mainPage.css';


export default function MainPage() {
  return (
    <>
    <div className='Container'>
        <div className='LeftPanel'>
            <p className='ChatsLabel'>Chats</p>
            <input type='search' placeholder='search for chat...' className='SearchInput'></input>
            <button className='createNewChatBtn'></button>
            <div className='ChatList'></div>
            <div className='UserProfile'></div>
        </div> {/*Groups window */}
        <div className='BottomPanel'>
            <div className='TopInfo'>
                <img src='https://static.thenounproject.com/png/630729-200.png' className='ChatPfp'></img>
                <div className='ChatName'>Very nice chat</div>
            </div>
            <div className='Chat'>something something here</div>
            <div className='BottomButtons'>
                <input type='text' className='InputMessage' placeholder='type here...'></input>
                <button className='SendMessage'>&#8594;</button>
            </div>
        </div> {/*Chat Window*/}
        <div className='RightPanel'>
            <div className='ChatInfo'></div>
            <div className='CustomizeChat'>    
        </div>
        </div> {/*For Media*/}
    </div>
    </>
  )
}
