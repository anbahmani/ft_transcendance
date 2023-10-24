import React from "react";
import { UPDATE_FRIENDSHIP } from "../GraphQl/Queries";
import { useMutation } from "@apollo/client";
import socket from '../game/socket'

export default function AcceptFriend({profile}: any) : React.ReactElement {

    const [updateFriendship, { loading, error }] = useMutation(UPDATE_FRIENDSHIP, {
    });

    const handleSubmit = async (event: any) => {
      event.preventDefault();
      try {
        console.log(profile);
        console.log("fid == ", profile.fid);
        const { data } = await updateFriendship({ variables: { status: "Accepted", id: parseInt(profile.fid) } });
        console.log('Friendship updated:', data.updateFriendship);
        socket.emit('updateFriendship', data.updateFriendship);
      } catch (error) {
        console.error('Error deleting friendship:', error);
      }
    };

    return (
        <div className='glass-friend-options' onClick={handleSubmit}>Accept</div>
    )
}