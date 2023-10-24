import React, { useState } from 'react';
import './Friends.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

interface FindFriendsProps {

  users: any;
  setProfile: React.Dispatch<any>;
}

export default function FindFriends({users, setProfile}: FindFriendsProps) :React.ReactElement {

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(users);

  const handleSearch = (event: any) => {
    console.log("Event: ", event.target.value);
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);

    const filteredUsers = users.filter((item: any) =>
      item.user.login42.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filteredUsers);
  };

  const func = ({user, status, fid, option}: any) => {

    setProfile((prevProfile : any)=> ({
      ...prevProfile,
      user: user,
      status: status,
      fid: fid,
      option: option,
    }));
  }

  const bulle = () => {

    return true;
  }

  return (
    <>
      <div className='input-with-icon'>
        <input
          type="text"
          placeholder="Find a user..."
          value={searchTerm}
          onChange={handleSearch}
        />
        {/*<FontAwesomeIcon icon={faMagnifyingGlass} className='icon'/>*/}
      </div>
      {searchTerm !== '' && bulle() && (
        <div className='searchlist'>
          <ul>
            {searchResults.map((item: any) => (
              <li onClick={() => func({user: item.user, status: item.status, fid: item.fid, option: item.option})} className='found' key={item.user.id}>{item.user.login42}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};