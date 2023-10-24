import React, { useEffect, useRef, useState } from "react";
import { useLocation } from 'react-router-dom';
import Paddle from "../game/objects/paddle.tsx";
import { PaddleEnemy } from "../game/objects/paddle.tsx";
import Ball from "../game/objects/ball.tsx";
import { player } from "../game/player.tsx";
import { NavLink, useNavigate } from "react-router-dom";
import socket from "../game/socket.ts";

interface InRankedSpectateProps {
    room: string,
}

function InRankedSpectate({room}: InRankedSpectateProps) {

    const [ obj, setObj ] = useState<any>(null);
    const [ position, setPosition ] = useState({x: 300, y: 200});
    const [ ratio, setRatio ] = useState({x: 1, y: 1});
    const [ hpos, sethpos ] = useState(200);
    const [ epos, setepos ] = useState(200);
    const [ end, setEnd ] = useState("");
    const [ input, setInput ] = useState({ up: false, down: false});
    const [ einput, esetInput ] = useState({ up: false, down: false});
    const inputRef = useRef(input);
    const einputRef = useRef(einput);

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

        const gameElement = document.querySelector('.game');
        if (gameElement) {
            const updateDimensions = () => {

                const { clientWidth, clientHeight } = gameElement;
                let widthRatio = 600 / clientWidth;
                let heightRatio = 400 / clientHeight;

                widthRatio = widthRatio === 0 ? 0.1 : widthRatio;
                heightRatio = heightRatio === 0 ? 0.1 : heightRatio;
                setRatio({x: widthRatio, y: heightRatio});
            };

            updateDimensions();

            window.addEventListener('resize', updateDimensions);

            return () => {
                window.removeEventListener('resize', updateDimensions);
            }
        }

    }, [position, hpos, epos]);

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
                    <div id="nest3">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <p>Waiting for : {room}</p>
            </>
        );
    }

    var score = `${player.login}: ${player.goal}        ${player.elogin}: ${player.egoal}`;

    if (end !== "") {

        return (
            <>
                    <h4>{end}</h4>
                    <h4>END OF GAME SPECTATE</h4>
            </>
        );
    }

    return (
        <>
            <p>{score}</p>
            <div className="game">
                <div className="board">
                    <Paddle up={input.up} down={input.down} pos={hpos} setpos={sethpos} ratio={ratio}/>
                    <PaddleEnemy up={einput.up} down={einput.down} pos={epos} setpos={setepos} ratio={ratio}/>
                    <div className="ball"
                    style={{top: (position.y / ratio.y) + 'px', left: (position.x / ratio.x) + 'px'}}>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function SpectateRanked({room}: InRankedSpectateProps) {

  const roomname : string = "room-" + room;

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
    <InRankedSpectate room={roomname} />
  );
}