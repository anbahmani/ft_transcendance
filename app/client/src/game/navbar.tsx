import React from 'react';
import './Home.scss'
import { NavLink } from 'react-router-dom';


interface ButtonProps {
    path: string,
    content: string
}

export function Button({path, content}: ButtonProps){
	return (
		<NavLink to={path}>
				<button className='glass-options'>{content}</button>
		</NavLink>
	)
}

function HomeButton(): React.ReactElement {
    return ( <Button path="/" content='Home'/> )
}

function ChatButton() {
    return ( <Button path="/chat" content='Chat'/> )
}

function FriendsButton() {
    return ( <Button path="/friends" content='Friends'/> )
}

function PongButton() {
    return ( <Button path="/game" content='Game'/> )
}

function ProfileButton() {
    return ( <Button path="/socket" content='Socket'/> )
}

export default function Navbar(): React.ReactElement {

    return (
        <div className='glass-nav d-flex d-flex justify-content-between'>
            <HomeButton/>
            <ChatButton/>
            <FriendsButton/>
            <PongButton/>
            <ProfileButton/>
        </div>
    );
}