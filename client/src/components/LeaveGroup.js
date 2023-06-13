import React from 'react'
import '../styles/leaveGroup.css'; 
import io from 'socket.io-client';
const socket = io.connect(process.env.REACT_APP_BACKEND_SERVER_URL);

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
        <div className='blurBackground'>
            <div className='containerLeaveGroup'>
                <button className='xClose3' onClick={props.toggle}>X</button>
                <p className='titleLeave'>You are about to leave group</p>
                <p className='convDescLeave'>If you leave you won't be able to access this conversation no more. Do you want to proceed?</p>
                <div className='buttonsLeave'>
                    <button className='cancelLeave' onClick={props.toggle}>Cancel</button>
                    <button className='proceedLeave' onClick={leaveGroup}>Proceed</button>
                </div>
                
            </div>
    </div>
  )
}
