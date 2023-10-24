import React, { useEffect, useRef, useState } from "react";
import { useLocation } from 'react-router-dom';
import Paddle from "./objects/paddle.tsx";
import { PaddleEnemy } from "./objects/paddle.tsx";
import Ball from "./objects/ball.tsx";
import { player } from "./player.tsx";
import { NavLink, useNavigate } from "react-router-dom";
import socket from "./socket.ts";

interface InSpectateProps {
    room: string,
}

function InSpectate({room}: InSpectateProps) {

    const [ obj, setObj ] = useState<any>(null);
    const [ position, setPosition ] = useState({x: 300, y: 200});
    const [ hpos, sethpos ] = useState(200);
    const [ epos, setepos ] = useState(200);
    const [ end, setEnd ] = useState("");
    const [ input, setInput ] = useState({ up: false, down: false});
    const [ einput, esetInput ] = useState({ up: false, down: false});
    const inputRef = useRef(input);
    const einputRef = useRef(einput);

    console.log('Query Name:', room);

    useEffect(() => {
        if (obj !== null) {
            player.room = obj.room;
            player.login = obj.login;
            player.elogin = obj.elogin;
            player.up = obj.up;
            player.down = obj.down;
            player.eUp = obj.eup;
            player.eDown = obj.edown;
            player.goal = obj.goal;
            player.egoal = obj.egoal;
        }
    }, [obj])

    useEffect(() => {
        socket.on('specdata', (data) => {
            console.log("Received: ", data);
            setObj(data);

        });

        return () => {
            socket.off('specdata');
        }
    });

    useEffect(() => {
        inputRef.current = input;
    }, [input]);

    useEffect(() => {
        einputRef.current = einput;
    }, [einput]);

    useEffect(() => {
        socket.on('goal', () => {
            player.goal++;
        });

        return () => {
            socket.off('goal');
        }
    });

    useEffect(() => {
        socket.on('egoal', () => {
                player.egoal++;
        });

        return () => {
            socket.off('egoal');
        }
    });

    useEffect(() => {
        socket.on('end', (winner) => {
            if (winner === 'host')
                setEnd(`Winner: ${player.login}`);
            else
                setEnd(`Winner: ${player.elogin}`);
        });

        return () => {
            socket.off('end');
        };
    }, []);

    useEffect(() => {
        socket.on('ball', (a, b) => {
                setPosition({x: a, y: b});
        });

        return () => {
            socket.off('ball');
        }
    }, []);

    useEffect(() => {
        socket.on('move', (key, value, side) => {

        if (side === "one") {
            if (key === "w") {
                player.up = value;
                setInput((prevInput) => ({ ...prevInput, up: value }));
            }
            else if (key === "s") {
                player.down = value;
                setInput((prevInput) => ({ ...prevInput, down: value }));
            }
        }
        else {
            if (key === "w") {
                player.eUp = value;
                esetInput((prevInput) => ({ ...prevInput, up: value }));
            }
            else if (key === "s") {
                player.eDown = value;
                esetInput((prevInput) => ({ ...prevInput, down: value }));
            }
        }
        });

        return () => {
            socket.off('move');
        }
      }, []);


    if (obj === null) {
        return (
            <>
                <div className="glass-panel">
                    <div id="nest3">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <p>Waiting for : {room}</p>
                </div>
            </>
        );
    }

    var score = `${player.login}: ${player.goal}        ${player.elogin}: ${player.egoal}`;

    if (end !== "") {

        return (
            <>
                <div className="glass-panel">
                    <h4>{end}</h4>
                    <h4>END OF GAME SPECTATE</h4>
                </div>
            </>
        );
    }

    return (
        <>
            {/*<Navbar />*/}
            <p>{score}</p>
            <div className="game">
                <div className="board">
                    {/*<Paddle up={input.up} down={input.down} pos={hpos} setpos={sethpos}/>
                    <PaddleEnemy up={einput.up} down={einput.down} pos={epos} setpos={setepos}/>*/}
                    <div className="ball"
                    style={{top: position.y + 'px', left: position.x + 'px'}}>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function Spectate() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const room : string = "room-" + queryParams.get('name');

  /*useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    }
  }, []);
  */
  useEffect(() => {
    console.log("Socket is connected ? ", socket.connected);
    console.log("SENDING SPECROOM");
    socket.emit('specroom', room);
  }, []);

  return (
    <InSpectate room={room} />
  );
}