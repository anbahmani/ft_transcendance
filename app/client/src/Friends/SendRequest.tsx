import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { SEND_FRIEND_REQUEST } from '../GraphQl/Queries';


function FriendshipForm() {
    const [userId, setUserId] = useState('');
  
    const [createFriendship, { loading, error }] = useMutation(SEND_FRIEND_REQUEST, {
    });
  
    const handleSubmit = async (event: any) => {
      event.preventDefault();
      try {
        const { data } = await createFriendship({ variables: { userId: parseInt(userId) } });
        console.log('New friendship created:', data.createFriendship);
        setUserId('');
      } catch (error) {
        console.error('Error creating friendship:', error);
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="User ID"
        />
        <button type="submit" disabled={loading}>
          Create Friendship
        </button>
        {error && <p>Error: {error.message}</p>}
      </form>
    );
  }

  export default FriendshipForm;