import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { player } from '../player';

interface ballProps {

  position: {x: number, y: number},
  setPosition: React.Dispatch<React.SetStateAction<{x: number, y: number}>>
  hpos: number;
  epos: number;
}

function Ball({position, setPosition, hpos, epos}: ballProps): {x: number, y: number} {

  const [speed, setSpeed] = useState({ x: 2, y: 2 });
  //const speedRef = useRef(speed);

 // useEffect(() => {
  //  speedRef.current = speed;
  //}, [speed]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prevPosition) => ({
        x: prevPosition.x + speed.x, //speedRef.current.x
        y: prevPosition.y + speed.y, //speedRef.current.y
      }));
    }, 20);

    return () => {
      clearInterval(interval);
    };

  }, [speed]);

  useEffect(() => {
    let hosttop = hpos - 40;
    let hostbot = hpos + 40;

    let playtop = epos - 40;
    let playbot = epos + 40;
  
    if (position.x <= 10 && position.y >= hosttop && position.y <= hostbot && speed.x < 0) {
      setSpeed((prevSpeed) => ({ ...prevSpeed, x: -(prevSpeed.x) }));
    }

    else if (position.x >= 590 && position.y >= playtop && position.y <= playbot && speed.x > 0) {
      setSpeed((prevSpeed) => ({ ...prevSpeed, x: -(prevSpeed.x) }));
    }

    else if (position.x <= 0 && speed.x < 0) {
      socket.emit('egoal', player.room);
      setSpeed((prevSpeed) => ({ ...prevSpeed, x: -prevSpeed.x }));
    }
    else if (position.x >= 600 && speed.x > 0) {
      socket.emit('goal', player.room);
      setSpeed((prevSpeed) => ({ ...prevSpeed, x: -prevSpeed.x }));
    }
    else if (position.y <= 0 && speed.y < 0) {
      setSpeed((prevSpeed) => ({ ...prevSpeed, y: -prevSpeed.y }));
    }
    else if (position.y >= 390 && speed.y > 0) {
      setSpeed((prevSpeed) => ({ ...prevSpeed, y: -prevSpeed.y }));
    }

  }, [position, speed]);

  return ({x: position.x, y: position.y});

}

export default Ball;
