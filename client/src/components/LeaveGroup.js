import React from 'react'
import '../styles/leaveGroup.css'; 
import io from 'socket.io-client';
const socket = io.connect("localhost:3001");

export default function LeaveGroup(props) {
    var convData = {
        userId: props.userId,
        convId: props.convId
    }
    const leaveGroup = () =>{
        socket.emit("leaveGroup", convData);
        props.toggle();
    }
    return (
    <div className='ContainerLeaveGroup'>
        <h1>You are about to leave group</h1>
        <button className='collapseComponent' onClick={props.toggle}>X</button>
        <p>If you leave you won't be able to access this conversation no more. Do you want to proceed?</p>
        <button onClick={props.toggle}>Cancel</button>
        <button onClick={leaveGroup}>Proceed</button>
    </div>
    
  )
}
