import React from 'react'
import '../styles/manageUser.css';

function ManageUser(userId) {
  return (
    <div className='container'>
        <button id='customizeUser' className='dm'>Message</button>
        <button id='customizeUser' className='viewProfile'>View profile</button>
        <button id='customizeUser' className='block'>Block</button>

        <button id='customizeUser' className='adminPerms'>Make admin</button>
        <button id='customizeUser' className='removeMember'>Remove member</button>
    </div>
  )
}

export default ManageUser