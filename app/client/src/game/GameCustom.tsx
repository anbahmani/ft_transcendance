import React, { useState, useEffect, useRef } from "react";
import { HexColorPicker, RgbaColorPicker } from "react-colorful";
import { player } from "./player";
import Ball from "./objects/customBall";
import Paddle, {PaddleEnemy, Paddles} from "./objects/customPaddle";
import socket from "./socket";
import { CREATE_GAME } from "../GraphQl/Queries";
import { UPDATE_GAME } from "../GraphQl/Queries";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_USERS, FORMAT_LIST_BLOCK, CREATE_DISCUSSION} from '../GraphQl/Queries';
import ScaleBall from "./objects/ScaleBall";
import {OnlineStatus, setOnlineStatus} from "../status";


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


export default function GameCustom(): React.ReactElement {

    const { loading, error, data } = useQuery(GET_ALL_USERS);
    const [userListVisible, setUserListVisible] = useState(false);
    const [ playing, setPlaying ] = useState<boolean>(false);
    const [ start, setStart ] = useState<boolean>(false);
    const [createGame, createGameResult] = useMutation(CREATE_GAME);
    const [ input, setInput ] = useState({ up:false, down:false });
    const [ einput, esetInput ] = useState({ up:false, down:false });
    const [updateGame, updateGameResult] = useMutation(UPDATE_GAME);
    const [ position, setPosition ] = useState({x: 300, y: 200});
    const [ hpos, sethpos] = useState(200);
    const [ epos, setepos] = useState(200);
    const [ ratio, setRatio ] = useState({x: 1, y: 1});
    const [ end, setEnd ] = useState("");
    const [createMP] = useMutation(CREATE_DISCUSSION);
    const inputRef = useRef(input);
    const einputRef = useRef(einput);
    const blockList = useQuery(FORMAT_LIST_BLOCK);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeColorPicker, setActiveColorPicker] = useState<boolean>(false);
    const [ alphaPicker, setAlphaPicker ] = useState<boolean>(false);
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
    const [selectedColor, setSelectedColor] = useState<{
        getter: ColorProps;
        type: string;
        setter: React.Dispatch<React.SetStateAction<ColorProps>>;
    } | null>(null);
    const user = JSON.parse(sessionStorage.getItem("user") as string);

    player.login = user.login42;
    player.id = user.id;
    player.host = true;
    player.room = "customroom-" + player.login;

    //socket.connect();

    useEffect(() => {
        socket.emit('customCreateRoom', player.login);
    }, []);

    useEffect(() => {
        setOnlineStatus("inGame");

        return () => {
            setOnlineStatus("Connected");
        };
    });

    useEffect(() => {
        const handleStart = async (log: string, id: number) => {

            console.log("handleStart");
            
            player.elogin = log;
            player.eid = id;
            setStart(true);

            try {
                if (createGameResult.loading) {
                    console.log("LOADING");
                } else if (createGameResult.error) {
                    console.log("ERROR");
                   } else {
                    const result = await createGame({
                        variables: { type: "Custom", userId: id }
                    });
                    if (result.data && result.data.createGame) {
                        console.log("create game result: ", result.data.createGame);
                        player.gameid = result.data.createGame.id;
                        socket.emit('gameId', {id: player.gameid, room: player.room});
                    }
                }
            } catch (error) {
                console.log(error);
            }

            socket.off('customStart', handleStart);
        };
    
        socket.on('customStart', handleStart);
    
        return () => {
            socket.off('customStart', handleStart);
        };

    }, [createGame, createGameResult.loading, createGameResult.error, player]);

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
        socket.on('specroom', () => {

            socket.emit('specdata',
            {
                room: player.room,
                login: player.login,
                elogin: player.elogin,
                up: player.up,
                down: player.down,
                eup: player.eUp,
                edown: player.eDown,
                goal: player.goal,
                egoal: player.egoal,
                hpos: hpos,
                epos: epos,
                iup: input.up,
                idown: input.down,
                eiup: einput.up,
                eidown: einput.down,
                posx: position.x,
                posy: position.y
            });
        });

        return () => {
            socket.off('specroom');
        }
    }, [player]);

    useEffect(() => {
        socket.on('playing', () => {
            console.log("Playing true");

            setPlaying(true);
            setPosition({x: 300, y: 200});
        });

        return () => {
            socket.off('playing');
        };
    }, []);

    useEffect(() => {
        inputRef.current = input;
    }, [input]);

    useEffect(() => {
        einputRef.current = einput;
    }, [einput]);


    //Paddle({up: input.up, down: input.down, pos: hpos, setpos: sethpos});
    //PaddleEnemy({up: einput.up, down: einput.down, pos: epos, setpos: setepos});
    Paddles({up: input.up, eup: einput.up, down: input.down, edown: einput.down, pos: hpos, epos: epos, setpos: sethpos, setepos: setepos});

    const ballPos = Ball({position, setPosition, hpos, epos});

    useEffect(() => {
        if (playing) {
            socket.emit('ball', player.room, ballPos.x, ballPos.y);
        }
    });

    useEffect(() => {

        const handleUnload = () => {

            if (start)
                socket.emit('customEnd', player.room, "enemy");
        };

        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('unload', handleUnload);
        };

    }, [start]);

    useEffect(() => {
        socket.on('goal', () => {
            if (playing) {
                player.goal++;
                if (player.goal >= 2)
                    socket.emit('customEnd', player.room, "host");
            }
        });

        return () => {
            socket.off('goal');
        }
    }, [playing]);

    useEffect(() => {
        socket.on('egoal', () => {
            if (playing) {
                player.egoal++;
                if (player.egoal >= 2)
                    socket.emit('customEnd', player.room, "enemy");
            }
        });

        return () => {
            socket.off('egoal');
        }
    }, [playing]);

    useEffect(() => {
        const handleEnd = async (winner: string) => {

            console.log("handleEnd");

            const win_id = winner === 'host' ? player.id : -1;

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
            if (winner === 'host') {
                if (player.host) {
                setEnd(`Winner: ${player.login}`);
                player.eid = player.id;
                } else {
                setEnd(`Winner: ${player.elogin}`);
                }
            } else {
                if (player.host) {
                setEnd(`Winner: ${player.elogin}`);
                } else {
                setEnd(`Winner: ${player.login}`);
                }
            }
        };
      
        socket.on('customEnd', handleEnd);
      
        return () => {
          socket.off('customEnd', handleEnd);
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
        socket.on('move', (key, value, side) => {

            //console.log(`${key} <:> ${value}`);
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

      const emitUpdateColors = () => {
        socket.emit('updateColors', {roomlogin: player.login, colors: {paddleColor, epaddleColor, ballColor, lineColor, backColor}});
      };
    
      useEffect(() => {
        const interval = setInterval(() => {
            emitUpdateColors();
        }, 2000);
    
        return () => {
            clearInterval(interval);
        };

      }, [paddleColor, epaddleColor, ballColor, lineColor, backColor]);
    
      const detectKeyDown: EventListener = (e: unknown) => {
        const keyboardEvent = e as KeyboardEvent;
        if (playing) {
            if (keyboardEvent.key === "w") {
                //console.log("UP PRESS");
                if (player.up == false) {
                    player.up = true;
                    socket.emit('move', player.room, "w", true, "one");
                    setInput((prevInput) => ({ ...prevInput, up: true }));
                }
            }
            else if (keyboardEvent.key === "s") {
             //console.log("DOWN PRESS");
            if (player.down == false) {
                    player.down = true;
                    socket.emit('move', player.room, "s", true, "one");
                    setInput((prevInput) => ({ ...prevInput, down: true }));
            }

            }
        }
    }

    const detectKeyUp: EventListener = (e: unknown) => {
        const keyboardEvent = e as KeyboardEvent;
        if (playing) {
            if (keyboardEvent.key === "w") {
             //console.log("UP RELEASE");
            if (player.up == true) {
                    player.up = false;
                    socket.emit('move', player.room, "w", false, "one");
                    setInput((prevInput) => ({ ...prevInput, up: false }));
            }
            }
            else if (keyboardEvent.key === "s") {
               // console.log("DOWN RELEASE");
                if (player.down == true) {
                    player.down = false;
                    socket.emit('move', player.room, "s", false, "one");
                    setInput((prevInput) => ({ ...prevInput, down: false }));
                }
            }
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', detectKeyDown, true);
        return () => {
            document.removeEventListener('keydown', detectKeyDown, true);
        }
    }, [playing]);

    useEffect(() => {
        document.addEventListener('keyup', detectKeyUp, true);
        return () => {
            document.removeEventListener('keyup', detectKeyUp, true);
        }
    }, [playing]);


    if (loading) {

        return (
            <p>LOADING</p>
        );

        return (
            <>
                <div className="glass-panel">
                    <p>Users loading</p>
                    <div id="nest3">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </>
        );
    }

    if (error) {

        return (
            <p>Error on Users query: {error.message}</p>
        );
    }

    if (blockList.loading) return (<p>Blocklist Loading...</p>);
    if (blockList.error) return (<p>Blocklist Error: {blockList.error.message}</p>);


    const def_users = data.users.filter((user: any) => user.login42 !== player.login);

    const blocksId = blockList.data.formatListBlock.map((block: any) => block.id);
    
    const users = def_users.filter((user: any) => !blocksId.includes(user.id));

    var score = `${player.login}: ${player.goal}        ${player.elogin}: ${player.egoal}`;
  const handleElementClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, colorState: ColorProps, colorStateUpdater: React.Dispatch<React.SetStateAction<ColorProps>>, type: string) => {
    if (!playing) {
        setMousePos({ x: event.clientX, y: event.clientY });
        setSelectedColor({ type: type, getter: colorState, setter: colorStateUpdater});
        setActiveColorPicker(true);
    }
  };


  const handleSubElementClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, colorState: ColorProps, colorStateUpdater: React.Dispatch<React.SetStateAction<ColorProps>>, type: string) => {
    if (!playing) {
        event.stopPropagation();
        handleElementClick(event, colorState, colorStateUpdater, type);
    }

  };

  const handleColorChange = (newColor: string) => {
    if (selectedColor) {
      selectedColor.setter(prevColorProps => ({
        ...prevColorProps,
        color: newColor
      }));
    }
    //socket.emit('colorChange', {room: player.login, type: selectedColor?.type, color: selectedColor?.getter});
  };

  const handleRgbaChange = (newColor: RgbaProps) => {
    if (selectedColor) {
        selectedColor.setter(prevColorProps => ({
            ...prevColorProps,
            rgba: { r: newColor.r,
                    g: newColor.g,
                    b: newColor.b,
                    a: newColor.a
                }
        }));
        //socket.emit('colorChange', {room: player.login, type: selectedColor?.type, color: selectedColor?.getter});
    }
  };

  const changeGlow = () => {
    if (selectedColor) {
        selectedColor.setter(prevColorProps => ({
            ...prevColorProps,
            glow: !prevColorProps.glow
        }));
        //socket.emit('colorChange', {room: player.login, type: selectedColor?.type, color: selectedColor?.getter});

    }
  };

  const changePicker = () => {
    if (alphaPicker)
        setAlphaPicker(false);
    else
        setAlphaPicker(true);
  };

  const sendPlaying = () => {
    socket.emit('playing', player.login);
  };
  
  const toggleUserList = () => {
    setUserListVisible(!userListVisible);
  };
  
  const sendInvitation = (userLogin: string, userId: number) => {
    console.log("sendCustomInvite to : ", userLogin);

    const newMP = createMP({variables:{userId: userId}, context: {
        headers: {
            "Apollo-Require-Preflight": "true"
        }
    }}).then((data : any) => {
        socket.emit('gameInvitation', {userId: player.id, discussionId: data.data.createDiscussion.id, message: player.login});
        socket.emit('sendCustomInvite', {roomlogin: player.login, login: userLogin});
    }).catch((error) => {
        console.log("ERROR: ", error);
    });
  };

  const activatePlaying = () => {
    setPlaying(true);
    console.log("playing: ", playing);
  };

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
        {playing && <p style={{alignSelf: 'end'}}>{score}</p>}
        <div className="game" 
                    style={{ 
                        backgroundColor: backColor.color,
                        boxShadow: backColor.glow
                        ? `0px 0px 10px 5px rgba(${backColor.rgba.r}, ${backColor.rgba.g}, ${backColor.rgba.b}, ${backColor.rgba.a})`
                        : 'none',
                        transition: 'box-shadow 0.3s ease-in-out',
                    }}
        onClick={(event) => handleElementClick(event, backColor, setBackColor, "backColor")}>
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
                }}
                onClick={(event) => handleSubElementClick(event, lineColor, setLineColor, "lineColor")}></div>
            <div
            className='paddle'
                style={{
                    width: (10 / ratio.x) + 'px',
                    height: (80 / ratio.y) + 'px',
                    top: (hpos / ratio.y) + 'px', backgroundColor: paddleColor.color,
                    boxShadow: paddleColor.glow
                        ? `0px 0px 10px 5px rgba(${paddleColor.rgba.r}, ${paddleColor.rgba.g}, ${paddleColor.rgba.b}, ${paddleColor.rgba.a})`
                        : 'none',
                    transition: 'box-shadow 0.3s ease-in-out',
                }}
                onClick={(event) => handleSubElementClick(event, paddleColor, setPaddleColor, "paddleColor")}
            ></div>
            <div
                className='epaddle'
                style={{
                    width: (10 / ratio.x) + 'px',
                    height: (80 / ratio.y) + 'px',
                    top: (epos / ratio.y) + 'px', backgroundColor: epaddleColor.color,
                    boxShadow: epaddleColor.glow
                        ? `0px 0px 10px 5px rgba(${epaddleColor.rgba.r}, ${epaddleColor.rgba.g}, ${epaddleColor.rgba.b}, ${epaddleColor.rgba.a})`
                        : 'none',
                    transition: 'box-shadow 0.3s ease-in-out',
                 }}
                onClick={(event) => handleSubElementClick(event, epaddleColor, setEPaddleColor, "epaddleColor")}
            ></div>
            <div
                className='ball'
                style={{
                    width: (10 / ratio.x) + 'px',
                    height: (10 / ratio.y) + 'px',
                    top: (playing ? (position.y / ratio.y) + 'px': '50%'),
                    left: (playing ? (position.x / ratio.x) + 'px': '50%'),
                    backgroundColor: ballColor.color,
                    boxShadow: ballColor.glow
                        ? `0px 0px 10px 5px rgba(${ballColor.rgba.r}, ${ballColor.rgba.g}, ${ballColor.rgba.b}, ${ballColor.rgba.a})`
                        : 'none',
                    transition: 'box-shadow 0.3s ease-in-out',
                }}
                onClick={(event) => handleSubElementClick(event, ballColor, setBallColor, "ballColor")}
            ></div>
        </div>
      </div>
      {activeColorPicker ? (
        alphaPicker === false ? (
        <>
            <div
                style={{
                    position: "absolute",
                    top: `${mousePos.y}px`,
                    left: `${mousePos.x}px`,
                }}
                >
                <button onClick={changePicker}>Swap to Glow Picker</button>
                <HexColorPicker color={selectedColor?.getter.color} onChange={handleColorChange} />
                <button onClick={() => {setActiveColorPicker(false)}}>Disable Color Picker</button>
                <button onClick={changeGlow}>Toggle Glow</button>
            </div>
        </>
      ) : (
        <>
            <div
                style={{
                    position: "absolute",
                    top: `${mousePos.y}px`,
                    left: `${mousePos.x}px`,
                }}
                >
                <button onClick={changePicker}>Swap to Color Picker</button>
                <RgbaColorPicker color={selectedColor?.getter.rgba} onChange={handleRgbaChange} />
                <button onClick={() => {setActiveColorPicker(false)}}>Disable Glow Picker</button>
                <button onClick={changeGlow}>Toggle Glow</button>
            </div>
        </>
        )
      ) : null}
      <button onClick={activatePlaying}>Activate Playing</button>
      {start && <button onClick={sendPlaying}>Start game</button> }
      {!start && <button onClick={toggleUserList}>Invite player</button> }
      {!start && userListVisible && (
         <ul className="glass-panel-custom">
            {users.map((user: any) => (
                <li key={user.id} onClick={() => sendInvitation(user.login42, user.id)}>
                    {user.login42}
                </li>
            ))}
        </ul>
      )}
    </>
  );
}