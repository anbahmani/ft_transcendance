import React from "react";
import { UNBLOCK_USER } from "../GraphQl/Queries";
import { useMutation } from "@apollo/client";
import socket from '../game/socket'

interface idProps {
    id: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
}

export default function Unblock({id, setter}: idProps) : React.ReactElement {

    const [block, { loading, error }] = useMutation(UNBLOCK_USER, {
    });

    const handleSubmit = async (event: any) => {
      event.preventDefault();
      try {

        console.log("Unblock id : ", id);
        await block({ variables: {userId: id}});
        console.log("UNBLOCKING");
        setter(0);
        socket.emit('rerender');
        //console.log('unblockedUser: ', data.removeBlockedUser);
        //socket.emit('unblockedUser', data.removeBlockedUser);
      } catch (error) {
        console.error('Error unblocking User:', error);
      }
    };

    return (
        <div className='glass-friend-options' onClick={handleSubmit}>Unblock User</div>
    )
}