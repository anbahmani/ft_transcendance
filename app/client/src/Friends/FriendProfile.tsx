import React, { useEffect, useRef, useState } from "react";
import AddFriend from "./AddFriend";
import RejectFriend from "./RejectFriend";
import DeleteFriend from "./DeleteFriend";
import AcceptFriend from "./AcceptFriend";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_PLAYED_GAMES_BY_ID, PLAYED_GAMES_BY_ID, FORMAT_LIST_BLOCK } from "../GraphQl/Queries";
import SpectateGame from "./SpectateGame";
import Block from "./Block";
import Unblock from "./Unblock";
import socket from "../game/socket";

interface formatBlock {
    id: number;
    admin: boolean;
};

export default function FriendProfile({profile, users, status}: any): React.ReactElement {

    const [ blockStatus, setBlockStatus ] = useState<number>(0);
    const [ render, setRender ] = useState<boolean>(false);
    const divRef = useRef<HTMLLIElement | null>(null);
    const [overflow, setOverflow] = useState<boolean>(false);
    /*const {data, loading, error} = useQuery(PLAYED_GAMES_BY_ID, {
        variables: { take: 5, userId: profile.user ? profile.user.id : 0},
    });*/

    const {data, loading, error} = useQuery(ALL_PLAYED_GAMES_BY_ID, {
        variables: { userId: profile.user ? profile.user.id : profile.owner.id},
    });

    const blockList = useQuery(FORMAT_LIST_BLOCK);

    useEffect(() => {

    });

    useEffect(() => {
        socket.on('rerender', () => {
            blockList.refetch();
            setRender(!render);
        });

        return () => {
            socket.off('rerender');
        }
    });

    const checkOverflow = () => {
        if (divRef.current) {

            const { width, height } = divRef.current.getBoundingClientRect();
            const over = width < 260;

            setOverflow(over);
        }
    }

    useEffect(() => {
        checkOverflow();
        window.addEventListener('resize', checkOverflow);

        return () => {
            window.removeEventListener('resize', checkOverflow);
        }
    }, []);

    useEffect(() => {

        if (blockList.loading) return ;
        if (blockList.error) return ;
        if (!profile.user) return ;

        const block = blockList.data.formatListBlock ? blockList.data.formatListBlock.find((block : formatBlock) => block.id === profile.user.id) : null;



        if (block) {
            if (block.admin === true)
                setBlockStatus(1);
            else if (blockStatus != 2)
                setBlockStatus(2);
        }
    }, [blockList.data, profile.user]);

    if (loading) return (<p>Games Loading...</p>);
    if (error) return (<p>Games Error: {error.message}</p>);

    if (blockList.loading) return (<p>Blocklist Loading...</p>);
    if (blockList.error) return (<p>Blocklist Error: {blockList.error.message}</p>);

    const playedGames : any = data.getAllGamesFromId.filter((game : any) => game.status !== 'Playing');
    const lastGame = data.getAllGamesFromId[0];
    const inGame = lastGame === undefined ? false : lastGame.status === 'Playing' ? true : false;
    if (profile.user === null || profile.user === undefined) {

        return (
            <div>Please select a friend</div>
        );
    }


    let totalGames = playedGames.length;
    let wins = 0;

    for (const game of playedGames) {

        if (game.winnerId === profile.user.id)
            wins++;
    }

    const winPercentage = (wins / totalGames) * 100;
    const formattedWinPercentage = winPercentage.toFixed(2);
    return (
        <div className='profile-card'>
            <div className='profile-title'>
                <div className='profile-name'>{profile.user.first_name} {profile.user.last_name}
                </div>
                <img alt="" src={profile.user.image} className="profile-pic" />
            </div>
            <div className={profile.owner.id === profile.user.id ? 'profile-myhistory' : 'profile-history'}>
                <div className='profile-history-title'>
                        Played Games
                        {blockStatus !== 2 &&
                        <div style={{color: '#5D76A9', marginLeft: '1em'}}>
                            {totalGames !== 0 ? `${formattedWinPercentage}%` : ""}
                        </div>
                        }
                </div>
                <ul>
                    {(blockStatus !== 2 && profile.option === "delete" && playedGames.map((game: any) => (
                        <li key={game.id} ref={divRef} className='profile-history-game'>
                            <div style={{ color: game.winnerId === profile.user.id ? '#32de84' : '#E52B50' }}>
                                {game.winnerId === profile.user.id ? "VICTORY " : "LOSS    "}
                            </div>
                            {!overflow && 
                            <>
                                <div>{users.find((user: any) => user.id === game.player1Id).login42}</div>
                                <div>{users.find((user: any) => user.id === game.player2Id).login42}</div>
                                <div>{game.type}</div>
                            </>
                            }
                        </li>
                    ))) 
                    || (blockStatus === 0 && profile.user.id === profile.owner.id && playedGames.map((game: any) => (
                        <li key={game.id} ref={divRef}className='profile-history-game'>
                            <div style={{ color: game.winnerId === profile.user.id ? '#32de84' : '#E52B50' }}>
                                {game.winnerId === profile.user.id ? "VICTORY " : "LOSS "}
                            </div>
                            {!overflow &&
                            <>
                                <div>{users.find((user: any) => user.id === game.player1Id).login42}</div>
                                <div>{users.find((user: any) => user.id === game.player2Id).login42}</div>
                                <div>{game.type}</div>
                            </>
                            }
                        </li>
                    ))) 
                    || (blockStatus !== 2 && <div>{profile.user.login42} is not in your friendlist</div>)}
                </ul>
            </div>
            {blockStatus !== 2 && profile.user.id !== profile.owner.id && <div className='profile-options'>
                {/*<div className='glass-options'>Add friend</div>*/}
                {profile.option === "add" ?
                    <AddFriend profile={profile} />
                : profile.option === "choose" ?
                    <>
                        <AcceptFriend profile={profile} />
                        <RejectFriend profile={profile} />
                    </>
                : <DeleteFriend profile={profile} />
                }
                {blockStatus === 0 ? 
                    <Block id={profile.user.id} setter={setBlockStatus}/>
                    : <Unblock id={profile.user.id} setter={setBlockStatus}/>
                }
                {inGame === true && profile.option !== "add" && profile.option !== "choose" && 
                    <SpectateGame name={profile.user.login42} />
                }
            </div>
            }
        </div>
    );
}