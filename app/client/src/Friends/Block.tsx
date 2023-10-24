import React from "react";
import { BLOCK_USER } from "../GraphQl/Queries";
import { useMutation } from "@apollo/client";
import socket from '../game/socket'

interface idProps {
  id: number,
  setter: React.Dispatch<React.SetStateAction<number>>,
}

export default function Block({id, setter}: idProps) : React.ReactElement {

    const [block, { loading, error }] = useMutation(BLOCK_USER, {
    });

    const handleSubmit = async (event: any) => {
      event.preventDefault();
      try {
        await block({ variables: {userId: id}});
        console.log("BLOCKING");
        setter(1);
        socket.emit('rerender');
        //socket.emit('blockedUser', data.blockUser);
      } catch (error) {
        console.error('Error blocking User:', error);
      }
    };

    return (
        <div className='glass-friend-options' onClick={handleSubmit}>Block User</div>
    )
}