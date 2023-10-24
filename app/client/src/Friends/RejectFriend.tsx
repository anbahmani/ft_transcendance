import React from "react";
import { DELETE_FRIENDSHIP } from "../GraphQl/Queries";
import { useMutation } from "@apollo/client";
import socket from '../game/socket'


export default function RejectFriend({profile}: any) : React.ReactElement {

    const [removeFriendship, { loading, error }] = useMutation(DELETE_FRIENDSHIP, {
    });

    const handleSubmit = async (event: any) => {
      event.preventDefault();
      try {
        const { data } = await removeFriendship({ variables: { friendship: parseInt(profile.fid) } });
        console.log('Friendship deleted:', data.removeFriendship);
        socket.emit('deleteFriendship', data.removeFriendship);
      } catch (error) {
        console.error('Error deleting friendship:', error);
      }
    };

    return (
        <div className='glass-friend-options' onClick={handleSubmit}>Reject</div>
    )
}