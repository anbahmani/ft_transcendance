import React, { useEffect, useRef, useState } from "react";
import socket from './socket.ts';
import Navbar from "./navbar.tsx";
import Paddle from "./objects/paddle.tsx";
import { PaddleEnemy } from "./objects/paddle.tsx";
import Ball from "./objects/ball.tsx";
import { player } from "./player.tsx";
import { NavLink, useNavigate } from "react-router-dom";
import { CREATE_GAME, UPDATE_GAME } from "../GraphQl/Queries.ts";
import { useMutation } from "@apollo/client";
import { setOnlineStatus } from "../status.ts";

interface ButtonProps {
    path: string,
    content: string
}

function GameButton({path, content}: ButtonProps){
	return (
		<NavLink onClick={player.reset} to={path}>
				<button className='glass-button'>{content}</button>
		</NavLink>
	)
}

function RematchButton(): React.ReactElement {

    return (<GameButton path="/gamestart" content='Play again ?'/>)
  }

 export function Gameplay() {

    const [ input, setInput ] = useState({ up:false, down:false });
    const [ einput, esetInput ] = useState({ up:false, down:false });
    const [updateGame, {loading, error, data}] = useMutation(UPDATE_GAME);
    const [ position, setPosition ] = useState({x: 300, y: 200});
    const [ ratio, setRatio ] = useState({x: 1, y: 1});
    const [ hpos, sethpos] = useState(200);
    const [ epos, setepos] = useState(200);
    const [ end, setEnd ] = useState("");
    const inputRef = useRef(input);
    const einputRef = useRef(einput);

    useEffect(() => {

        setOnlineStatus("inGame");

        return () => {

            setOnlineStatus("Connected");
        };
        
    });

    useEffect(() => {

        const handleGameId = (id: number) => {

            player.gameid = id;
        };
        
        socket.on('gameId', handleGameId);

        return () => {

            socket.off('gameId', handleGameId);
        }
    }, []);
    
    useEffect(() => {
        socket.on('specroom', () => {
            console.log("Received specroom");
            if (player.host) {
                console.log("SENDING SPECDATA");
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
            }
        });

        return () => {
            socket.off('specroom');
        }
    });

    /*useEffect(() => {
        const sendUpdateGame = async () => {
            
            if (player.host) {
                try {
                    if (loading) {
                        console.log("LOADING");
                    } else if (error) {
                        console.log("ERROR");
                    } else {
                        const result = await updateGame({
                            variables: { id: player.gameid, status: "over",  userId: player.eid}
                        });
                        if (result.data && result.data.updateGame) {
                            console.log("create game result: ", result.data.updateGame);
                            (true);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }, []);*/

    useEffect(() => {
        inputRef.current = input;
    }, [input]);

    useEffect(() => {
        einputRef.current = einput;
    }, [einput]);

    if (player.host) {
        const ballPos = Ball({position, setPosition, hpos, epos});
        //setHit(false);
        useEffect(() => {
            if (player.host) {
                socket.emit('ball', player.room, ballPos.x, ballPos.y);
            }
        });
    }

    useEffect(() => {

        const handleUnload = () => {

            if (player.host) {
                socket.emit('end', player.room, "enemy");
            } else {
                socket.emit('end', player.room, "host");
            }
        };

        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('unload', handleUnload);
        };

    }, []);

    useEffect(() => {
        socket.on('goal', () => {
            player.goal++;
            if (player.host)
                if (player.goal >= 2)
                    socket.emit('end', player.room, "host");
        });

        return () => {
            socket.off('goal');
        }
    });

    useEffect(() => {
        socket.on('egoal', () => {
                player.egoal++;
                if (player.host)
                    if (player.egoal >= 2)
                        socket.emit('end', player.room, "enemy");
        });

        return () => {
            socket.off('egoal');
        }
    });

    useEffect(() => {
        const handleEnd = async (winner: string) => {

            const win_id = winner === 'host' ? player.id : player.eid;

            if (win_id === player.id) {
                try {
                    if (loading) {
                        console.log("LOADING");
                    } else if (error) {
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
      
        socket.on('end', handleEnd);
      
        return () => {
          socket.off('end', handleEnd);
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

    useEffect(() => {
        document.addEventListener('keydown', detectKeyDown, true);
        return () => {
            document.removeEventListener('keydown', detectKeyDown, true);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keyup', detectKeyUp, true);
        return () => {
            document.removeEventListener('keyup', detectKeyUp, true);
        }
    }, []);

    const detectKeyDown: EventListener = (e: unknown) => {
        const keyboardEvent = e as KeyboardEvent;
        if (keyboardEvent.key === "w") {
            //console.log("UP PRESS");
            if (player.up == false) {
                player.up = true;
                socket.emit('move', player.room, "w", true, player.host === true ? "one" : "two");
                setInput((prevInput) => ({ ...prevInput, up: true }));
            }
        }
        else if (keyboardEvent.key === "s") {
           // console.log("DOWN PRESS");
           if (player.down == false) {
                player.down = true;
                socket.emit('move', player.room, "s", true, player.host === true ? "one" : "two");
                setInput((prevInput) => ({ ...prevInput, down: true }));
           }

        }
    }

    const detectKeyUp: EventListener = (e: unknown) => {
        const keyboardEvent = e as KeyboardEvent;
        if (keyboardEvent.key === "w") {
           // console.log("UP RELEASE");
           if (player.up == true) {
                player.up = false;
                socket.emit('move', player.room, "w", false, player.host === true ? "one" : "two");
                setInput((prevInput) => ({ ...prevInput, up: false }));
           }
        }
        else if (keyboardEvent.key === "s") {
            //console.log("DOWN RELEASE");
            if (player.down == true) {
                player.down = false;
                socket.emit('move', player.room, "s", false, player.host === true ? "one" : "two");
                setInput((prevInput) => ({ ...prevInput, down: false }));
            }
        }
    }
 
    var hostW: boolean;
    var hostS: boolean;

    var joinW: boolean;
    var joinS: boolean;

    var score: string;

    var hscore: string;
    var escore: string;

    if (player.host) {
        score = `${player.login}: ${player.goal}        ${player.elogin}: ${player.egoal}`;
        hscore = `${player.goal}`;
        escore = `${player.egoal}`;
        hostW = input.up;//player.up;
        hostS = input.down;//player.down;
        joinW = einput.up;//player.eUp;
        joinS = einput.down;//player.eDown;
    }
    else {
        score = `${player.elogin}: ${player.goal}        ${player.login}: ${player.egoal}`;
        hscore = `${player.goal}`;
        escore = `${player.egoal}`;
        hostW = einput.up;//player.eUp;
        hostS = einput.down;//player.eDown;
        joinW = input.up;//player.up;
        joinS = input.down;//player.down;
    }

    if (end !== "") {

        return (
            <>
            {/*<Navbar />*/}
            <div className="container rounded glass-panel text-center pt-0">
                <h4>{end}</h4>
                <RematchButton />
            </div>
            </>
        )
    }

    return (
        <>
            <div className="container rounded glass-panel text-center pt-0"
                style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="game">
                    <div className="score">
                        <div>{hscore}</div>
                        <div>{escore}</div>
                    </div>
                    <div className="board">
                        <Paddle up={hostW} down={hostS} pos={hpos} setpos={sethpos} ratio={ratio}/>
                        <PaddleEnemy up={joinW} down={joinS} pos={epos} setpos={setepos} ratio={ratio}/>
                        <div className="ball"
                        style={{top: (position.y / ratio.y) + 'px', left: (position.x / ratio.x) + 'px'}}>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function GameLoading() {

    const [ state, setState ] = useState<boolean>(false);
    const [createGame, {loading, error, data}] = useMutation(CREATE_GAME);
    const navigate = useNavigate();

    useEffect(() => {
        const handleStart = async (param: boolean, log: string, id: number) => {
            console.log("Starting game");
            console.log(`param: ${param}, log: ${log}, id: ${id}`);
            
            if (player.host)
                player.elogin = log;
            player.eid = id;
            setState(param);

            if (player.host) {
                console.log("handleStart setState TRUE");
    
                try {
                    if (loading) {
                        console.log("LOADING");
                    } else if (error) {
                        console.log("ERROR");
                    } else {
                        const result = await createGame({
                            variables: { type: "Ranked", userId: id }
                        });
                        if (result.data && result.data.createGame) {
                            console.log("create game result: ", result.data.createGame);
                            player.gameid = result.data.createGame.id;
                            socket.emit('gameId', {id: player.gameid, room: player.room});
                            console.log("Game id: ", player.gameid);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
            socket.off('start', handleStart);
        };
    
        socket.on('start', handleStart);
    
        return () => {
            socket.off('start', handleStart);
        };
    }, [createGame, loading, error, player]);
    
    if (state) {
        navigate("/Gamelobby");
    }

    return (
        <>
            {/*<Navbar />*/}
            <div className="container rounded glass-panel text-center pt-0">
                <div id="nest3">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </>
    )
}

export default function GameStart() {

    console.log("GameStart component rendering");
    const user = JSON.parse(sessionStorage.getItem("user") as string);

    player.login = user.login42;
    player.id = user.id;

    //socket.connect();
    /*useEffect(() => {
        socket.connect();

        return () => {
            socket.disconnect();
        }
    });
    */

    useEffect(() => {
        socket.emit('getroom', player.login, user.id);
        console.log("SOCKET EMIT GETROOM");
    }, []);

    console.log("user: ", JSON.stringify(user));
    console.log(`Sending getroom ${player.login} and ${user.id}`);  
    useEffect(() => {
        const handleGetRoom = (clientId: any, data: any, host: any) => {
            console.log("Setting room: ", data);
            console.log("Host: ", host);
            player.room = data;
            player.load = true;
            if (host == "one")
                player.host = true;
            else {
                let parts = data.split("-");
                player.elogin = parts[parts.length -1];
            }
            socket.off('getroom', handleGetRoom); // Unsubscribe the event after the first use
        };

        socket.on('getroom', handleGetRoom);

        return () => {
            socket.off('getroom', handleGetRoom); // Clean up the event listener on component unmount
        };
    }, []);

    return (
        <GameLoading />
    )
}