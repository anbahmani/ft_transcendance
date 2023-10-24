import '../game/Home.scss';
import './Friends.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_ALL_USERS, 
  updateUser, 
  LIST_FRIENDSHIPS, 
  SUB_CREATE_FRIENDSHIP, 
  UPDATE_FRIENDSHIP } 
  from '../GraphQl/Queries';
import FindFriends from './FindFriends';
import FriendProfile from './FriendProfile';
import FriendshipForm from './SendRequest';
import MyButtonComponent from './ListFriendRequests';
import socket from '../game/socket.ts';
import { useUser } from '../lib/authHook.tsx';
import { isTypeNode } from 'graphql';
import Friendlist from './FriendList.tsx';


interface StatusProps {
  [login: string]: string;
}

interface Props {
  count: number;
  setCount: React.Dispatch<number>;
}

function getFriendlist() {

    const { data, loading, error, refetch } = useQuery(LIST_FRIENDSHIPS);
    const [ fdata, setfData ] = useState<any>([]);

    return ({data, fdata, setfData, loading, error, refetch});
}

function FriendsPage({count, setCount}: Props): React.ReactElement {
    const my_user = JSON.parse(sessionStorage.getItem("user") as string);
    const { loading, error, data } = useQuery(GET_ALL_USERS);
    const [ profile, setProfile ] = useState<any>({owner: my_user, user: my_user, status: "empty", fid: "-1", option: "empty"});
    const [ udata, setuData ] = useState<any>(null);
    const [ statusData, setStatusData ] = useState<string>("Connected");
    const [ statusList, setStatusList ] = useState<StatusProps | null>(null);
    const [ finalUsers, setFinalUsers ] = useState<any | null>(null);
    const [ joinedUsers, setJoinedUsers ] = useState<any | null>(null);
    const [ ownerIdArray, setOwnerIdArray ] = useState<any>(undefined);
    const [ receiverIdArray, setReceiverIdArray ] = useState<any>(undefined);
    const getFriends = getFriendlist();

    if (!useUser())
    {
      window.location.replace("/");
      return (<></>);
    }

    const increment = () => {
      setCount(count + 1);
    };

    useEffect(() => {
      socket.on('friendshipCreated', (ndata) => {
        console.log("friendship created");
        getFriends.refetch();
        increment();
      });

      return () => {
        socket.off('friendshipCreated');
      };
    }, []);

    useEffect(() => {
      socket.on('friendshipUpdated', (ndata) => {
        console.log("friendship updated");
        getFriends.refetch();
        increment();
      });

      return () => {
        socket.off('friendshipUpdated');
      };
    }, []);

    useEffect(() => {
      socket.on('friendshipRemoved', (data) => {
        console.log("friendship removed");
        getFriends.refetch();
        increment();
      });

      return () => {
        socket.off('friendshipRemoved');
      };
    }, []);


    useEffect(() => {

      if (!loading && !error) {
        setuData(data);
      }

    }, [loading, error, data]);

    useEffect(() => {

      const handleStatusList = (props: StatusProps) => {


          let status = props[profile.user.login42];

          if (status === null || status === undefined)
            status = "Disconnected";
          
          setStatusData(status);

        setStatusList(props);
      };
    
      socket.on('statusList', handleStatusList);
    
      return () => {
        socket.off('statusList', handleStatusList);
      };

    });

    useEffect(() => {
      if (!getFriends.loading && !getFriends.error) {
        getFriends.setfData(getFriends.data);
      }
    }, [getFriends.loading, getFriends.error, getFriends.data]);

    useEffect(() => {

      if (!getFriends.fdata) return;
      if (!udata || !udata.users) return;

      const friendships = getFriends.fdata;
      const currUser = udata.users.find((user: any) => user.login42 === my_user.login42);
      const users = udata.users.filter((user: any) => user.login42 !== currUser.login42);

      let _ownerIdArray : any;
      let _receiverIdArray : any;

    if (friendships && friendships.findAll) {
      _ownerIdArray = friendships.findAll.map((friendship: any) => {
          const user = users.find((user: any) => (user.id === friendship.ownerId || user.id === friendship.receiverId));
          if (currUser.id === friendship.ownerId || currUser.id === friendship.receiverId)
              return { user, status: friendship.status, fid: friendship.id };
          return null;
        }).filter((item: any) => item !== null && item.user !== undefined && item.status === "Accepted");
        
      _receiverIdArray = friendships.findAll.map((friendship: any) => {
          const user = users.find((user: any) => user.id === friendship.receiverId);
          if (currUser.id === friendship.ownerId)
              return { user, status: friendship.status, fid: friendship.id };
          return null;
      }).filter((item: any) => item !== null && item.user !== undefined && item.status !== "Accepted");

      setOwnerIdArray(_ownerIdArray);
      setReceiverIdArray(_receiverIdArray);

      console.log("owner: ", _ownerIdArray);
      console.log("receiver: ", _receiverIdArray);
    
     }

    }, [udata, getFriends.fdata]);

    useEffect(() => {

      if (!udata || !udata.users) return ;
      if (!ownerIdArray && !receiverIdArray) return ;

      const users = udata.users.filter((user: any) => user.login42 !== my_user.login42);


  const tmpUsers = users.map((user: any) => {
    // Check if user exists in ownerIdArray

    const ownerItem = ownerIdArray !== undefined ? ownerIdArray.find((item: any) => item.user.id === user.id) : null;
    
    if (ownerItem) {
      return {
        user: ownerItem.user,
        status: ownerItem.status,
        fid: ownerItem.fid,
        option: "delete",
        connect: statusList ? statusList[ownerItem.user.login42] : "Disconnected",
      };
    }
  
    // Check if user exists in receiverIdArray
    const receiverItem = receiverIdArray !== undefined ? receiverIdArray.find((item: any) => item.user.id === user.id) : null;
  
    if (receiverItem) {
      return {
        user: receiverItem.user,
        status: receiverItem.status,
        fid: receiverItem.fid,
        option: "choose",
        connect: statusList ? statusList[receiverItem.user.login42] : "Disconnected",
      };
    }
  
  });

  const _joinedUsers = tmpUsers.sort((a, b) => {
    if (a.option === "choose" && b.option !== "choose") {
      return -1; // Mettre "choose" en premier
    } else if (a.option !== "choose" && b.option === "choose") {
      return 1; // Mettre "choose" en second
    } else {
      return 0; // Pas de changement d'ordre relatif
    }
  });

    setJoinedUsers(_joinedUsers);

    }, [ownerIdArray, receiverIdArray, udata, statusList]);


    useEffect(() => {
      if (!udata || !udata.users) return ;

      const users = udata.users.filter((user: any) => user.login42 !== my_user.login42);

      const _finalUsers = users.map((user: any) => {
        // Check if user exists in ownerIdArray

        const ownerItem = ownerIdArray !== undefined ? ownerIdArray.find((item: any) => item.user.id === user.id) : null;
        
        if (ownerItem) {
          return {
            user: ownerItem.user,
            status: ownerItem.status,
            fid: ownerItem.fid,
            option: "delete",
            connect: statusList ? statusList[ownerItem.user.login42] : "Disconnected",
          };
        }
      
        // Check if user exists in receiverIdArray
        const receiverItem = receiverIdArray !== undefined ? receiverIdArray.find((item: any) => item.user.id === user.id) : null;
      
        if (receiverItem) {
          return {
            user: receiverItem.user,
            status: receiverItem.status,
            fid: receiverItem.fid,
            option: "choose",
            connect: statusList ? statusList[receiverItem.user.login42] : "Disconnected",
          };
        }
      
        // If not found in either array, create the default object
        return {
          user,
          status: "finder",
          fid: "-1",
          option: "add",
          connect: statusList ? statusList[user.login42] : "Disconnected",
        };

    });
    setFinalUsers(_finalUsers);

    }, [udata, ownerIdArray, receiverIdArray, statusList]);

    useEffect(() => {

      console.log("JU: ", joinedUsers);
    }, [count]);

    if (getFriends.loading) return <p>Friends Loading...</p>;
    if (getFriends.fdata === null) return <p>Friends Loading...</p>;
    if (getFriends.error) return <p>Friends error: {getFriends.error.message}</p>;

    if (loading) return <p>Users Loading...</p>;
    if (udata === null) return <p>Users Loading...</p>;
    if (error) return <p>Users Error: {error.message}</p>;
      
    
      
    const func = ({user, status, fid, option, connect}: any) => {

        //setProfile({user, status, fid, option});
        setProfile((prevProfile : any)=> ({
          ...prevProfile,
          user: user,
          status: status,
          fid: fid,
          option: option,
          connect: connect,
        }));
        
    }

    return (
            <div className='container glass-friend-panel pt-1'>
                <Friendlist joinedUsers={joinedUsers} setProfile={setProfile} count={count}/>
                <FriendProfile profile={profile} users={udata.users} status={statusData}/>
                <FindFriends users={finalUsers} setProfile={setProfile}/>
            </div>
    );
}

export default function Friends() : React.ReactElement {

  const [count, setCount] = useState<number>(0);

  return (
    <FriendsPage count={count} setCount={setCount}/>
  );
}