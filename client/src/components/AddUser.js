import React, {useState } from 'react';
import '../styles/addUser.css'; 
import {Image} from 'cloudinary-react';
import defaultPfp from '../img/pfpDefault.png';
import io from 'socket.io-client';
const socket = io.connect(process.env.REACT_APP_BACKEND_SERVER_URL);

function AddUser(props) {
    const [searchValue, setSearchValue] = useState('');
    const [foundUsers, setFoundUsers] = useState([]);
    const [firstSearch, setFirstSearch] = useState(true);

    const Search = () =>{
        if(searchValue !== ''){
            var dataToSend = {
                searchValue: searchValue,
                convId : props.convId
            }
            socket.emit('searchForUsers', dataToSend)
            socket.on("receive_searched_users", (usersData) =>{
                if(usersData.length > 0){
                    setFoundUsers(usersData);
                    setFirstSearch(true);
                }else{
                    setFirstSearch(false);
                }
            });
        } 
    }
    const AddNewMember = (userId,e) => {
        
        if(e){
            var dataM = {
                userId: userId,
                convId: props.convId,
                roomId: props.roomId
            }
            socket.emit('add_member', dataM);
        }
        
    };
    return (
        <div className='blurBackground'>
            <div className='containerAddUser'>
                <div className='xClose' onClick={props.toggle}>X</div>
                <p className='titleAddUser'>Add new users</p>
                <div className='searchAreaAdd'>
                    <input type='search' className='inputSearchUser' placeholder='Search...' onChange={e => setSearchValue(e.target.value)}/>
                    <button className='searchBtn' onClick={Search}>&#10095;</button>
                </div>
                <div className='searchedUsersList'>
                    {firstSearch ? foundUsers.map((content) => (
                        <div className='userSearched' key={content.userId}>
                            {content.isAdded ? 
                            <input 
                                className='alreadyAddedBtn' 
                                type='button' 
                                value='Add'
                            /> 
                            : 
                            <input 
                                className='addUserBtn'
                                type='button' 
                                value='Add' 
                                onClick={e => {
                                    AddNewMember(content.userId, e)
                                    Search()
                                }}
                            />
                            }
                            <Image className='imageSearched' cloudName={props.dataCld.cloudName} publicId={content.pfp} 
                                onError={() =>{
                                    return(<img className='imageSearched' src={defaultPfp} alt='no image'/>)
                                }}
                            />
                            <div className='usernameEmail'>
                                <p className='usernameSearched'>{content.username}</p>
                                <p className='emailSearched'>{content.email}</p>
                            </div>
                        </div>
                    )):
                        <div className='noUsersSearched'>No users found</div>
                    }
                </div>
            </div>
        </div>
    )
}

export default AddUser