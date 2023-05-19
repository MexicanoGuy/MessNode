import React from 'react'
import '../styles/manageUser.css';
import { useState, useEffect, useLayoutEffect } from 'react';
import { io } from 'socket.io-client';
const socket = io.connect("https://messnode-backend.onrender.com:3001");

function ManageUser(props) {
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [memberIsAdmin, setMemberIsAdmin] = useState(false);

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
    props.toggle();
  }
  const RemoveAdmin= () =>{
    var removeAdminData = {
      convId: props.convId,
      memberId: props.memberId
    }
    socket.emit('remove_admin', removeAdminData);
    props.toggle();
  }
  const RemoveMember = () =>{
    var removeData = {
      convId: props.convId,
      memberId: props.memberId
    }
    socket.emit('remove_member', removeData);
    props.toggle();
  }
  return (
    <div className='containerManageUser'>
        <button className='customizeUser dmUser'>Message</button>
        <button className='customizeUser viewProfile'>View profile</button>
        <button className='customizeUser blockUser'>Block</button>
        {userIsAdmin ?
        <>
          {!memberIsAdmin ?
            <button className='customizeUser removeMember' onClick={RemoveMember}>Remove member</button> 
          : null
          }
          {!memberIsAdmin ?
            <button className='customizeUser adminPerms' onClick={GiveAdmin}>Make admin</button>
            : null
          }
          {memberIsAdmin && !permData.userId == permData.memberId ?
            <button className='customizeUser adminPerms' onClick={RemoveAdmin}>Remove admin</button>
          : null
          }
        </>
        : null}
    </div>
  )
}

export default ManageUser