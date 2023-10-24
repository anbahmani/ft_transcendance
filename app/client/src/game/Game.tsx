import React, { useEffect } from 'react';
import "./Game.css";
import { Button } from './navbar.tsx';
import { NavLink } from "react-router-dom";
import socket from './socket.ts';

interface OnlineStatus {
  [login: string]: string;
}

function MatchButton(): React.ReactElement {

  return (<Button path="/gamestart" content='Join Matchmaking'/>)
}

function CustomButton(): React.ReactElement {

  return (<Button path="/gamecustom" content='Create Game'/>)
}

export default function Game(): React.ReactElement {

  console.log("GAME RENDER");

    return (
      <>
        <div className='container rounded glass-panel text-center pt-0'>
          <div className='test col-12'>Pong Game</div>
          <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <MatchButton />
            <CustomButton />
            {/*
            <NavLink to={"/joincustom?room=anremiki"}>
              <button className='glass-options'>Join Game</button>
            </NavLink>
            <NavLink to={"/CustomSpectate?room=anremiki"}>
              <button className='glass-options'>Spec Game</button>
            </NavLink>
            */}
          </div>
          <p className='mt-5'>Control the paddle by using W and S keys</p>
        </div>
      </>
    );
}