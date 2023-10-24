import React from "react"
import socket from "../game/socket";
import { useNavigate } from "react-router-dom";

export default function sendInvitation(senderlog: string, receiverlog: string, discussionId: number | undefined, my_id: number) {

    const navigate = useNavigate();

    if (discussionId === undefined || discussionId === -1)
        return <></>;
    const InviteGame = () => {    

        socket.emit('gameInvitation', {userId: my_id, discussionId: discussionId, message: senderlog});
        socket.emit('sendCustomInvite', {roomlogin: senderlog, login: receiverlog});     
        navigate("/gamecustom");
    };

    return (
            <button onClick={InviteGame}>Send Invitation</button>
    );
}