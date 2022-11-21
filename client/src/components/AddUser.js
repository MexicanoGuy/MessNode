import {React, useState, useEffect} from 'react'
import '../styles/addUser.css'; 

import io from 'socket.io-client';
const socket = io.connect("localhost:3001");

function AddUser() {
    const Search = () =>{
        if(searchValue !== '') socket.emit('searchForUsers', searchValue);
    }

    const [searchValue, setSearchValue] = useState('');
    const [foundUsers, setFoundUsers] = useState([]);
    return (<>
        <div className='ContainerAddUser'>
            <input type='search' className='inputSearchUser' placeholder='Search...' onChange={e =>{
                setSearchValue(e.target.value);
            }}></input>
            <button className='searchBtn' onClick={Search}>&#10095;</button>
            <div className='searchedUsers'>
                {/* {foundUsers.map((content) =>{ */}
                    <div className='userFound' key='{content.userId}'>
                        <input className='checkboxFound' type='checkbox'></input>
                        <img className='imageFound' src='https://i.pinimg.com/550x/20/0d/72/200d72a18492cf3d7adac8a914ef3520.jpg'></img>
                        <a className='usernameFound'>content.username</a>
                    </div>
                {/* })} */}  
            </div>
            <button className='submitAddPeople'>Add people</button>
        </div>
    
    </>)
}

export default AddUser