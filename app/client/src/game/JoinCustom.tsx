import React, { useState, useEffect, useRef } from "react";
import { player } from "./player";
import {Paddles} from "./objects/customPaddle";
import socket from "./socket";
import { useLocation, useNavigate } from "react-router-dom";
import { setOnlineStatus } from "../status";
import { UPDATE_GAME } from "../GraphQl/Queries";
import { useQuery, useMutation } from "@apollo/client";

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

export default function JoinCustom(): React.ReactElement {

    const [updateGame, updateGameResult] = useMutation(UPDATE_GAME);
    const [ playing, setPlaying ] = useState<boolean>(false);
    const [ input, setInput ] = useState({ up:false, down:false });
    const [ einput, esetInput ] = useState({ up:false, down:false });
    const [ position, setPosition ] = useState({x: 300, y: 200});
    const [ ratio, setRatio ] = useState({x: 1, y: 1});
    const [ hpos, sethpos] = useState(200);
    const [ epos, setepos] = useState(200);
    const [ end, setEnd ] = useState("");
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

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const elogin = queryParams.get('room') as string;
    const room : string = "customroom-" + elogin;
    const user = JSON.parse(sessionStorage.getItem("user") as string);
    const navigate = useNavigate();

    player.login = user.login42;
    player.elogin = elogin;
    player.id = user.id;
    player.room = room;

    //socket.connect();

    useEffect(() => {

        setOnlineStatus("inGame");

        return () => {

            setOnlineStatus("Connected");
        };
    });
    
    useEffect(() => {
        socket.emit('customJoinRoom', {roomlogin: player.elogin, login: player.login, id: player.id});
    }, []);

    useEffect(() => {
        socket.on('getColors', (colors) => {

            console.log("Access Granted");

            setPaddleColor(colors.paddleColor);
            setEPaddleColor(colors.epaddleColor);
            setBallColor(colors.ballColor);
            setLineColor(colors.lineColor);
            setBackColor(colors.backColor);
        });

        return () => {
            socket.off('getColors');
        };

    }, []);

    const emitGetUpdate = () => {
        socket.emit('getUpdate', player.elogin);
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
            setPaddleColor(colors.paddleColor);
            setEPaddleColor(colors.epaddleColor);
            setBackColor(colors.backColor);
            setBallColor(colors.ballColor);
            setLineColor(colors.lineColor);
        });

        return () => {
            socket.off('getUpdate');
        }
    });

    useEffect(() => {
        socket.on('colorChanged', (type, color) => {

            console.log(`colorChanged ${type}`);
            switch (type) {
                case "paddleColor":
                    setPaddleColor(color);
                    break;
                case "epaddleColor":
                    setEPaddleColor(color);
                    break;
                case "ballColor":
                    setBallColor(color);
                    break;
                case "lineColor":
                    setLineColor(color);
                    break;
                case "backColor":
                    setBackColor(color);
                    break;
                default:
                    break;
            }

        });

        return () => {
            socket.off('colorChanged');
        }
    });

    useEffect(() => {
        socket.on('deniedAccess', () => {

            console.log("ACCESS DENIED");
            navigate({
                pathname: '/deniedaccess',
                search: `?room=${elogin}`
            });
        });

        return () => {
            socket.off('deniedAccess');
        };
    });

    useEffect(() => {
        socket.on('playing', () => {
            setPlaying(true);
        });

        return () => {
            socket.off('playing');
        };
    });

    useEffect(() => {
        inputRef.current = input;
    }, [input]);

    useEffect(() => {
        einputRef.current = einput;
    }, [einput]);

    //Paddle({up: einput.up, down: einput.down, pos: epos, setpos: setepos});
    //PaddleEnemy({up: input.up, down: input.down, pos: hpos, setpos: sethpos});
    Paddles({up: einput.up, eup: input.up, down: einput.down, edown: input.down, pos: epos, epos: hpos, setpos: setepos, setepos: sethpos});

    useEffect(() => {
        socket.on('goal', () => {
            if (playing)
                player.goal++;
        });

        return () => {
            socket.off('goal');
        }
    });

    useEffect(() => {
        socket.on('egoal', () => {
            if (playing)
                player.egoal++;
        });

        return () => {
            socket.off('egoal');
        }
    });

    useEffect(() => {

        const handleGameId = (id: number) => {
            player.gameid = id;
        };
        
        socket.on('gameId', handleGameId);

        return () => {
            socket.off('gameId', handleGameId);
        };

    }, []);

    useEffect(() => {

        const handleUnload = () => {

            socket.emit('customEnd', player.room, "host");
        };

        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('unload', handleUnload);
        };

    }, []);

    useEffect(() => {
        const handleEnd = async (winner: string) => {
            
            const win_id = winner === 'host' ? -1 : player.id;

            socket.emit('testworking',{room: player.room, winId: win_id, playerId: player.id, gameId: player.gameid});

            if (win_id === player.id) {
                try {
                    if (updateGameResult.loading) {
                        console.log("LOADING");
                    } else if (updateGameResult.error) {
                        console.log("ERROR");
                    } else {
                        const result = await updateGame({
                            variables: { id: player.gameid, status: "Over",  userId: win_id}
                        });
                        if (result.data && result.data.updateGame) {
                            console.log("updated game result: ", result.data.updateGame);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            if (winner === 'host')
                setEnd(`Winner: ${player.elogin}`);
            else
                setEnd(`Winner: ${player.login}`);
        };
      
        socket.on('customEnd', handleEnd);
      
        return () => {
          socket.off('customEnd', handleEnd);
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

            if (key === "w") {
                player.eUp = value;
                esetInput((prevInput) => ({ ...prevInput, up: value }));
            }
            else if (key === "s") {
                player.eDown = value;
                esetInput((prevInput) => ({ ...prevInput, down: value }));
            }
        });

        return () => {
            socket.off('move');
        }
      }, []);

      const detectKeyDown: EventListener = (e: unknown) => {
        const keyboardEvent = e as KeyboardEvent;
        if (playing) {
            if (keyboardEvent.key === "w") {
                //console.log("UP PRESS");
                if (player.up == false) {
                    player.up = true;
                    socket.emit('move', player.room, "w", "two");
                    setInput((prevInput) => ({ ...prevInput, up: true }));
                }
            }
            else if (keyboardEvent.key === "s") {
            // console.log("DOWN PRESS");
            if (player.down == false) {
                    player.down = true;
                    socket.emit('move', player.room, "s", true, "two");
                    setInput((prevInput) => ({ ...prevInput, down: true }));
            }

            }
        }
    };

    const detectKeyUp: EventListener = (e: unknown) => {
        const keyboardEvent = e as KeyboardEvent;
        if (playing) {
            if (keyboardEvent.key === "w") {
            // console.log("UP RELEASE");
            if (player.up == true) {
                    player.up = false;
                    socket.emit('move', player.room, "w", false, "two");
                    setInput((prevInput) => ({ ...prevInput, up: false }));
            }
            }
            else if (keyboardEvent.key === "s") {
                //console.log("DOWN RELEASE");
                if (player.down == true) {
                    player.down = false;
                    socket.emit('move', player.room, "s", false, "two");
                    setInput((prevInput) => ({ ...prevInput, down: false }));
                }
            }
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', detectKeyDown, true);
        return () => {
            document.removeEventListener('keydown', detectKeyDown, true);
        };
    }, [playing]);

    useEffect(() => {
        document.addEventListener('keyup', detectKeyUp, true);
        return () => {
            document.removeEventListener('keyup', detectKeyUp, true);
        };
    }, [playing]);

    var score = `${player.login}: ${player.goal}        ${player.elogin}: ${player.egoal}`;

    if (end !== "") {

        return (
            <div
            className="container rounded glass-panel text-center pt-0"
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <p>Game ended</p>
            <p>{end}</p>
            </div>
        );
      }

    return (
        <>
          <div
            className="container rounded glass-panel text-center pt-0"
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <div className="game" 
                        style={{ 
                            backgroundColor: backColor.color,
                            boxShadow: backColor.glow
                            ? `0px 0px 10px 5px rgba(${backColor.rgba.r}, ${backColor.rgba.g}, ${backColor.rgba.b}, ${backColor.rgba.a})`
                            : 'none',
                            transition: 'box-shadow 0.3s ease-in-out',
                        }}>
                <div className="score">
                    <div>{player.goal}</div>
                    <div>{player.egoal}</div>
                </div>
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
                        top: (epos / ratio.y) + 'px', backgroundColor: paddleColor.color,
                        boxShadow: paddleColor.glow
                            ? `0px 0px 10px 5px rgba(${paddleColor.rgba.r}, ${paddleColor.rgba.g}, ${paddleColor.rgba.b}, ${paddleColor.rgba.a})`
                            : 'none',
                        transition: 'box-shadow 0.3s ease-in-out',
                    }}></div>
                <div className='epaddle'
                    style={{ 
                        width: (10 / ratio.x) + 'px',
                        height: (80 / ratio.y) + 'px',
                        top: (hpos / ratio.y) + 'px', backgroundColor: epaddleColor.color,
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
          </div>
        </>
    );
}