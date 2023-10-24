import react, { useState, useRef, useEffect } from 'react';
import './Friends.scss'
import React from 'react';
import { useQuery } from '@apollo/client';
import { FORMAT_LIST_BLOCK, GET_ALL_USERS, GET_USER, LIST_FRIENDSHIPS, PLAYED_GAMES_BY_ID } from '../GraphQl/Queries';
import socket from '../game/socket';
import AddFriend from "./AddFriend";
import RejectFriend from "./RejectFriend";
import DeleteFriend from "./DeleteFriend";
import AcceptFriend from "./AcceptFriend";
import SpectateGame from "./SpectateGame";
import Block from "./Block";
import Unblock from "./Unblock";


interface UserProps {

    id: number,
    login: string,
    login42: string,
    image: string,
};

interface formatBlock {
    id: number;
    admin: boolean;
};

//<<<<<<< HEAD
//export default function ChatProfile(tmpUser: UserProps | undefined) : React.ReactElement {
//=======
export default function ChatProfile(props: { tmpUser: UserProps | undefined}) : React.ReactElement {
//>>>>>>> origin/brahim

    const my_user = JSON.parse(sessionStorage.getItem("user") as string);
    const getFriends = useQuery(LIST_FRIENDSHIPS);
    const getUser = useQuery(GET_USER, {variables: {userId: props.tmpUser ? props.tmpUser.id : 0}});
    let   tmpUser = props.tmpUser;
    const getUsers = useQuery(GET_ALL_USERS);
    const [ profile, setProfile ] = useState<any>({ owner: my_user, user: my_user, status: "empty", fid: "-1", option: "empty"});
    const [ blockStatus, setBlockStatus ] = useState<number>(0);
    const [ render, setRender ] = useState<boolean>(false);
    const divRef = useRef<HTMLLIElement | null>(null);
    const [ overflow, setOverflow ] = useState<boolean>(false);
    const games = useQuery(PLAYED_GAMES_BY_ID, {
        variables: { take: 5, userId: tmpUser ? tmpUser.id : 0},
    });

    const blockList = useQuery(FORMAT_LIST_BLOCK);

    useEffect(() => {
        socket.on('rerender', () => {
            console.log("received RERENDER");
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

/*<<<<<<< HEAD
        const block = blockList.data.formatListBlock ? blockList.data.formatListBlock.find((block : formatBlock) => block.id === tmpUser?.id) : null;
=======*/
        console.log("blockList: ", blockList.data);
        const block = blockList.data.formatListBlock.lenght ? blockList.data.formatListBlock.find((block : formatBlock) => block.id === user.id) : null;
/*>>>>>>> origin/brahim*/

        console.log("block: ", block);


        if (block) {
            if (block.admin === true)
                setBlockStatus(1);
            else if (blockStatus != 2)
                setBlockStatus(2);
        }
    }, [blockList.data, tmpUser]);
    if (tmpUser === null || tmpUser === undefined) {
        
        return (
            <></>
            );
    }

    if (getFriends.loading) return <p>Friends Loading...</p>;
    if (getFriends.error) return <p>Friends error: {getFriends.error.message}</p>;

    if (games.loading) return <p>Games Loading...</p>;
    if (games.error) return <p>Games Error...</p>;

    if (blockList.loading) return <p>Block Loading...</p>;
    if (blockList.error) return <p>Block Error...</p>;

    if (getUser.loading) return <p>User Loading...</p>;
    if (getUser.error) return <p>User Error...</p>;

    if (getUsers.loading) return <p>Users Loading...</p>;
    if (getUsers.error) return <p>Users Error...</p>;

    const friendships = getFriends.data;

    let target : any;
    const user = getUser.data;
    const users = getUsers.data;
    if (friendships && friendships.findAll) {

        const friend = friendships.findAll.find((obj : any) => obj.id === tmpUser?.id);

        if (friend) {

            target = {user: user, status: friend.status, fid: friend.id, option: friend.status === "Accepted" ? "delete" : "choose" };
        } else {
            target = {user: user, status: "finder", fid: "-1", option: "add"};
        }

        setProfile((prevProfile: any) => ({
            ...prevProfile,
            user: target.user,
            status: target.status,
            fid: target.fid,
            option: target.option,
        }));
    }

    const playedGames : any = games.data.getGamesFromId.filter((game : any) => game.status !== 'Playing');
    const lastGame = games.data.getGamesFromId[0];
    const inGame = lastGame === undefined ? false : lastGame.status === 'Playing' ? true : false;

    if (profile.user === null || profile.user === undefined) {

        return (
            <div>Please select a friend</div>
        );
    }

    console.log("profile user: ", profile.user);
    console.log("block status: ", blockStatus);
    //return ( <h1> XD </h1> );
    return (
        <div className='profile-card'>
            <div className='profile-title'>
                <div className='profile-name'>{profile.user.first_name} {profile.user.last_name}</div>
                <img alt="" src={profile.user.image} className="profile-pic" />
            </div>
            {}
            <div className='profile-history'>
                <div className='profile-history-title'>
                        Game History
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