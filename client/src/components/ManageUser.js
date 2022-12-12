import React from 'react'
import '../styles/manageUser.css';
import { useState, useEffect, useLayoutEffect } from 'react';
import { io } from 'socket.io-client';
const socket = io.connect("localhost:3001");

function ManageUser(props) {
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [memberIsAdmin, setMemberIsAdmin] = useState(false);
  const [removeMember, setRemoveMember] = useState(false);
  var userId = localStorage.getItem('userId')
  var permData = {
    convId: props.convId, 
    userId: userId,
    memberId: props.memberId
  }
  useLayoutEffect(() =>{
    socket.emit('chat_permissions', permData );
    socket.on('receive_chat', (data) =>{
      setUserIsAdmin(data.userAdmin);
      setMemberIsAdmin(data.memberAdmin);
    });
  },[])
  
  const GiveAdmin = () =>{
    var adminData = {
      convId: props.convId,
      memberId: props.memberId
    }
    socket.emit('give_admin', adminData);
  }
  const RemoveAdmin= () =>{
    var removeAdminData = {
      convId: props.convId,
      memberId: props.memberId
    }
    socket.emit('remove_admin', removeAdminData);
  }
  const RemoveMember = () =>{
    var removeData = {
      convId: props.convId,
      memberId: props.memberId
    }
    socket.emit('remove_member', removeData);
  }
  return (
    <div className='container'>
        <button id='customizeUser' className='dm'>Message</button>
        <button id='customizeUser' className='viewProfile'>View profile</button>
        <button id='customizeUser' className='block'>Block</button>
        {userIsAdmin ?
        <>
          {!memberIsAdmin ?
          <button id='customizeUser' className='removeMember' onClick={RemoveMember}>Remove member</button> 
          : <></>
          }
          {!memberIsAdmin ?
            <button id='customizeUser' className='adminPerms' onClick={GiveAdmin}>Make admin</button>
            : ''
          }
          {memberIsAdmin ?<>
          
          <button id='customizeUser' className='adminPerms' onClick={RemoveAdmin}>Remove admin</button>
          </>
          :<></>
          }
        </>
        : <></>}
    </div>
  )
}

export default ManageUser