import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Paddles } from "../game/objects/paddle.tsx";
import Ball from "../game/objects/ball.tsx";
import { player } from "../game/player.tsx";
import { NavLink, useNavigate } from "react-router-dom";
import socket from "../game/socket.ts";

interface InCustomSpectateProps {
    room: string,
}

interface RgbaProps {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface ColorProps {
    color: string,
    glow: boolean,
    rgba: RgbaProps
}

interface RoomColors {
    paddleColor: ColorProps;
    epaddleColor: ColorProps;
    ballColor: ColorProps;
    lineColor: ColorProps;
    backColor: ColorProps;
}

function InCustomSpectate({room}: InCustomSpectateProps) {

    console.log(room);
    const [ playing, setPlaying ] = useState<boolean>(false);
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
    const [paddleColor, setPaddleColor] = useState({
        color: "#ffffff",
        glow: false,
        rgba : { r: 255, g: 255, b: 255, a: 0.6}
    });
    const [epaddleColor, setEPaddleColor] = useState({
        color: "#ffffff",
        glow: false,
        rgba : { r: 255, g: 255, b: 255, a: 0.6}
    });
    const [ballColor, setBallColor] = useState({
        color: "#ffffff",
        glow: false,
        rgba : { r: 255, g: 255, b: 255, a: 0.6}
    });
    const [lineColor, setLineColor] = useState({
        color: "#ffffff",
        glow: false,
        rgba : { r: 255, g: 255, b: 255, a: 0.6}
    });
    const [backColor, setBackColor] = useState({
        color: "#000000",
        glow: false,
        rgba : { r: 255, g: 255, b: 255, a: 0.6}
    });

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
            console.log("Emit customSpecRoom");
            socket.emit('customSpecRoom', player.login);
        }

    }, [obj]);

    useEffect(() => {
        socket.on('getColors', (colors) => {

            console.log("Received starting colors");

            if (colors) {
                setPaddleColor(colors.paddleColor);
                setEPaddleColor(colors.epaddleColor);
                setBallColor(colors.ballColor);
                setLineColor(colors.lineColor);
                setBackColor(colors.backColor);
            }
        });

        return () => {
            socket.off('getColors');
        };

    }, []);

    const emitGetUpdate = () => {
        socket.emit('getUpdate', player.login);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            emitGetUpdate();
        }, 2000);

        return () => {
            clearInterval(interval);
        };
    });

    useEffect(() => {
        socket.on('getUpdate', (colors : RoomColors) => {

            if (colors) {
                setPaddleColor(colors.paddleColor);
                setEPaddleColor(colors.epaddleColor);
                setBackColor(colors.backColor);
                setBallColor(colors.ballColor);
                setLineColor(colors.lineColor);
            } else {
                console.log("getUpdate empty colors");
            }
        });

        return () => {
            socket.off('getUpdate');
        }
    });

    useEffect(() => {
        socket.on('playing', () => {

            console.log("PLAYING TRUE");
            setPlaying(true);
        });

        return () => {
            socket.off('playing');
        };
    });

    useEffect(() => {
        socket.on('specdata', (data) => {
            console.log("Received: ", data);
            setObj(data);

        });

        return () => {
            socket.off('specdata');
        }
    }, []);

    useEffect(() => {
        inputRef.current = input;
    }, [input]);

    useEffect(() => {
        einputRef.current = einput;
    }, [einput]);

    useEffect(() => {
        socket.on('goal', () => {
            if (playing)
                player.goal++;
        });

        return () => {
            socket.off('goal');
        }
    }, [playing]);

    useEffect(() => {
        socket.on('egoal', () => {
            if (playing)
                player.egoal++;
        });

        return () => {
            socket.off('egoal');
        }
    }, [playing]);

   useEffect(() => {
        const handleEnd = (winner: string) => {
            
            if (winner === 'host')
                setEnd(`Winner: ${player.login}`);
            else
                setEnd(`Winner: ${player.elogin}`);
        };
      
        socket.on('customEnd', handleEnd);
      
        return () => {
          socket.off('customEnd', handleEnd);
        };

    }, []);

    useEffect(() => {

        const gameElement = document.querySelector('.specgame');
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

    }, [position]);

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

        //console.log(`MOVE: key = ${key}, value = ${value}, side = ${side}`);
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
        else if (side === "two") {
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

    
    Paddles({up: input.up, eup: einput.up, down: input.down, edown: einput.down, pos: hpos, epos: epos, setpos: sethpos, setepos: setepos});


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
            {playing && <p>{score}</p>}
            <div className="specgame" 
                        style={{ 
                            backgroundColor: backColor.color,
                            boxShadow: backColor.glow
                            ? `0px 0px 10px 5px rgba(${backColor.rgba.r}, ${backColor.rgba.g}, ${backColor.rgba.b}, ${backColor.rgba.a})`
                            : 'none',
                            transition: 'box-shadow 0.3s ease-in-out',
                        }}>
                <div className='split-line'
                    style={{
                        borderRight:  (5 / ratio.x)+ 'px dashed ' + lineColor.color,
                        boxShadow: lineColor.glow
                            ? `0px 0px 10px 5px rgba(${lineColor.rgba.r}, ${lineColor.rgba.g}, ${lineColor.rgba.b}, ${lineColor.rgba.a})`
                            : 'none',
                        transition: 'box-shadow 0.3s ease-in-out',
                    }}></div>
                <div className='paddle'
                    style={{ 
                        width: (10 / ratio.x) + 'px',
                        height: (80 / ratio.y) + 'px',
                        top: (hpos / ratio.y) + 'px', backgroundColor: paddleColor.color,
                        boxShadow: paddleColor.glow
                            ? `0px 0px 10px 5px rgba(${paddleColor.rgba.r}, ${paddleColor.rgba.g}, ${paddleColor.rgba.b}, ${paddleColor.rgba.a})`
                            : 'none',
                        transition: 'box-shadow 0.3s ease-in-out',
                    }}></div>
                <div className='epaddle'
                    style={{ 
                        width: (10 / ratio.x) + 'px',
                        height: (80 / ratio.y) + 'px',
                        top: (epos / ratio.y) + 'px', backgroundColor: epaddleColor.color,
                        boxShadow: epaddleColor.glow
                            ? `0px 0px 10px 5px rgba(${epaddleColor.rgba.r}, ${epaddleColor.rgba.g}, ${epaddleColor.rgba.b}, ${epaddleColor.rgba.a})`
                            : 'none',
                        transition: 'box-shadow 0.3s ease-in-out',
                     }}></div>
                <div className='ball'
                    style={{
                        width: (10 / ratio.x) + 'px',
                        height: (10 / ratio.y) + 'px',
                        top: (position.y / ratio.y) + 'px',
                        left: (position.x / ratio.x) + 'px',
                        backgroundColor: ballColor.color,
                        boxShadow: ballColor.glow
                            ? `0px 0px 10px 5px rgba(${ballColor.rgba.r}, ${ballColor.rgba.g}, ${ballColor.rgba.b}, ${ballColor.rgba.a})`
                            : 'none',
                        transition: 'box-shadow 0.3s ease-in-out',
                    }}></div>
            </div>
        </>
    );
}

export default function SpectateCustom({room} : InCustomSpectateProps) {

    const roomname : string = "customroom-" + room;
  
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
      socket.emit('specroom', roomname);
    }, []);
  
    return (
      <InCustomSpectate room={roomname} />
    );
  }