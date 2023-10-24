import React, { useEffect, useState } from "react";
import socket from "../game/socket";
import './Spectate.scss';
import SpectateRanked from "./SpectateRanked";
import SpectateCustom from "./SpectateCustom";

export default function Spectate() : React.ReactElement {

    const [ranked, setRanked] = useState<{ [room: string]: string[] }>({});
    const [custom, setCustom] = useState<{ [room: string]: string[] }>({});
    const [mode, setMode] = useState<{ target: { [room: string]: string[] }; name: string }>({
      target: ranked,
      name: "Ranked"
    });

    const [ room , setRoom ] = useState<string>('');
    const [ players, setPlayers ] = useState<string[]>([]);




    const emitGetRanked = () => {
        socket.emit('getRanked');
    };

    const emitGetCustom = () => {
        socket.emit('getCustom');
    };

    useEffect(() => {
        socket.on('getRanked', (rlist) => {
            
            console.log("List of Ranked: ", rlist);
            setRanked(rlist);
            if (mode.name === "Ranked")
                setMode({target: ranked, name: "Ranked"});
        });

        return () => {
            socket.off('getRanked');
        };
    }, [mode]);

    useEffect(() => {
        socket.on('getCustom', (clist) => {
            
            console.log("CustomList: ", clist);
            setCustom(clist);
            if (mode.name === "Custom")
                setMode({target: custom, name: "Custom"});
        });

        return () => {
            socket.off('getCustom');
        };
    }, [mode]);


    useEffect(() => {
        const interval = setInterval(() => {
            
            emitGetRanked();
            emitGetCustom();
        }, 2000);

        return () => {
            clearInterval(interval);
        };

    });

    useEffect(() => {

        if (room) {
            if (!mode.target.hasOwnProperty(room)) {
                setRoom('');
                setPlayers([]);
            }
            else {
                const playerlist = mode.target[room];
                setPlayers(playerlist);
            }
        }
    }, [room, mode]);
    
    const switchMode = () => {

        if (mode.name === "Ranked")
            setMode({target: custom, name: "Custom"});
        else
            setMode({target: ranked, name: "Ranked"});
        setRoom('');
        setPlayers([]);
    };

    const setter = (roomname: string, playerlist: string[]) => {

        setRoom(roomname);
        setPlayers(playerlist);
    }

    return (
        <>
            <div className="glass-panel-spec container rounded pt-1">
                <div className="glass-panel-mode">
                    <button className="glass-mode" onClick={switchMode}>{mode.name}</button>
                    <ul>
                        {Object.entries(mode.target).map(([roomName, values], index) => (
                            <li className="friend" key={index} onClick={() => setter(roomName, values)}>
                            {roomName}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="glass-panel-game">
                    <div className="glass-game-title">{room ? players : "Please select a room"}</div>
                    { room ?
                        mode.name === "Ranked" ? 
                            <SpectateRanked room={room} /> : <SpectateCustom room={room} />
                        :
                        <div id="nest3">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                    }
                </div>
            </div>
        </>
    );
}