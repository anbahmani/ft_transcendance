import React from "react";
import { SEND_FRIEND_REQUEST } from "../GraphQl/Queries";
import { useMutation } from "@apollo/client";
import socket from '../game/socket.ts';

export default function AddFriend({profile}: any) : React.ReactElement {

    const [createFriendship, { loading, error }] = useMutation(SEND_FRIEND_REQUEST, {
    });

   // console.log("props idD: ", props.userId);
    const handleSubmit = async (event: any) => {
      console.log("SENDING FRIENDSHIP");
      event.preventDefault();
     // console.log("in func id: ", props.userId);
      try {
        const { data } = await createFriendship({ variables: { userId: parseInt(profile.user.id) } });
        console.log('New friendship created:', data.createFriendship);
        socket.emit('newFriendship', data.createFriendship);
      } catch (error) {
        console.error('Error creating friendship:', error);
      }
    };

    return (
        <div className='glass-friend-options' onClick={handleSubmit}>Add friend</div>
    )
}