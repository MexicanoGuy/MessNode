import {React, useState, useEffect, useLayoutEffect} from 'react'
import '../styles/addUser.css'; 

import io from 'socket.io-client';
const socket = io.connect("localhost:3001");

function AddUser(props) {
    const [searchValue, setSearchValue] = useState('');
    const [foundUsers, setFoundUsers] = useState([]);
    const Search = () =>{
        if(searchValue !== ''){
            var dataToSend = {
                searchValue: searchValue,
                convId : props.convId
            }
            socket.emit('searchForUsers', dataToSend)
            socket.on("receive_searched_users", (usersData) =>{
                setFoundUsers(usersData);
            });
        } 
    }
    const AddNewMember = (userId,e) => {
        
        if(e){
            console.log('clicked');
            var dataM = {
                userId: userId,
                convId: props.convId
            }
            socket.emit('addNewMember', dataM);
        }
        
    };
    return (<>
        <div className='ContainerAddUser'>
            <input type='search' className='inputSearchUser' placeholder='Search...' onChange={e =>{ setSearchValue(e.target.value);
            }}/>
            <button className='searchBtn' onClick={Search}>&#10095;</button>
            <div className='searchedUsers'>
                {foundUsers.map((content) => (
                    <div className='userFound' key={content.userId}>
                        {content.isAdded ? 
                        <input 
                            className='alreadyAddedBtn' 
                            type='button' 
                            value='Add'
                        ></input> 
                        : 
                        <input 
                            className='addUserBtn' 
                            type='button' 
                            value='Add' 
                            onClick={e => AddNewMember(content.userId, e)}
                        ></input>
                        }
                        <img className='imageFound' src='https://i.pinimg.com/550x/20/0d/72/200d72a18492cf3d7adac8a914ef3520.jpg'></img>
                        <a className='usernameFound'>{content.username}</a>
                        <a className='emailFound'>{content.email}</a>
                    </div>
                ))}
            </div>
        </div>
    
    </>)
}

export default AddUser