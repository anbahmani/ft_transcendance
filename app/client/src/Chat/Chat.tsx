import '../game/Home.scss';
import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import './Chat.css'
import './newChat.scss'
import { NavLink, useNavigate } from "react-router-dom";
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { ADD_TO_CONV, BAN_USER, CREATE_CONVERSATIONS, CREATE_DISCUSSION, DOWNGRADE_ADMIN, GAMES_BY_ID, GET_ALL_CONVERSATIONS, GET_ALL_DISCUSSIONS, GET_BLOCK, GET_CONV_MSG, GET_DISCUSSION, GET_USER, JOIN_CONV, KICK_USER, MUTE_USER, PLAYED_GAMES_BY_ID, QUIT_CONV, SEARCH_CONV, SEARSH_USER, UNBAN_USER, UPDATE_CONV, UPGRADE_ADMIN, USERS} from '../GraphQl/Queries';
import { useUser } from '../lib/authHook';
import Logout from '../logout';
import socket from '../game/socket';

// Définition des types d'interface
interface MessageProps {
	sender?: User;
	content: string;
	date: Date;
    id?: number;
    type?: string;
  }

  interface Game {
  id: number;
  status: string;
  type: string;
  winnerId: number;
  player1: User;
  player2: User;
  }

  interface bannedUsers {
    userBanned : User;
  }

  interface mutedUsers {
    user? : User;
    mutedUntil : Date;
  }


  interface Conversation {
    messages: MessageProps[];
    name?: string;
    __typename: string;
    id: number;
    type?: string;
    admins?: User[];
    owner?: User;
    users?: User[];
    bannedUsers?: bannedUsers[];
    mutes?: mutedUsers[];
    participant1?: User;
    participant2?: User;
  }
  
  interface MessageListProps {
	messages: MessageProps[];
  }
  
/******************************************************************** */
/***************************** CHAT LIST **************************** */
/******************************************************************** */

function Conversations() {
	const { loading, error, data } = useQuery(GET_ALL_CONVERSATIONS);
	//console.log("data", data);
	return { loading, error, data };
  }

  function Discussions() {
	const { loading, error, data } = useQuery(GET_ALL_DISCUSSIONS);
	return { loading, error, data };
  }



/******************************************************************** */
/***************************** CHAT ZONE **************************** */
/******************************************************************** */

function sendChatMessage(message: string, idConversation: number, idUser: number, modeConv: boolean) {
	if (modeConv) {
		socket.emit('chatToConversation', {
		userId: idUser, // L'ID de l'utilisateur
		conversationId: idConversation, // L'ID de la conversation
		message: message, // Le contenu du message
		});
	} else {
		socket.emit('chatToDiscussion', {
		userId: idUser, // L'ID de l'utilisateur
		discussionId: idConversation, // L'ID de la conversation
		message: message, // Le contenu du message
		});
	}
}

function SendMessage({ idConversation, idUser, modeConv }: { idConversation: number; idUser: number; modeConv : boolean }) {
	
	const [newMessage, setNewMessage] = useState('');
	const handleSendMessage = () => {
		if (newMessage.trim() !== '') {
			sendChatMessage(newMessage, idConversation, idUser, modeConv);
			setNewMessage('');
		}
	};

	const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
		  handleSendMessage();
		}
	  };
	
	return (
		<div className='message-input'>
      <input type='text' placeholder='Type your message..' 
	  value={newMessage}
	  onChange={(e) => setNewMessage(e.target.value)}
	  onKeyUp={handleKeyUp} />
      <button onClick={handleSendMessage}>submit</button>
    </div>
  );
};

/******************************************************************** */
/***************************** CHAT FRIENDS ************************* */
/******************************************************************** */
interface User {
	id: number;
	login42: string;
	login : string;
	image: string;
  discussionId: undefined | number;
}

interface Chat {
	id: number;
	type: string;
}

function ChatFriends({ conversation, chatList, handleChatListFromChatFriends }: { conversation: Conversation | undefined, 	chatList: Conversation[], handleChatListFromChatFriends: any }) {
	const [modal, setModal] = useState (false);
	const myUser = JSON.parse(sessionStorage.getItem("user") as string);
	const [groupName, setGroupName] = useState ('');
	const Loading = useRef<HTMLInputElement | null>(null);
	const { loading, error, data } = useQuery(USERS);
  const [addUser] = useMutation(ADD_TO_CONV);
  const [kickUser] = useMutation(KICK_USER);
  const [muteUser] = useMutation(MUTE_USER);
  const [banUser] = useMutation(BAN_USER);
  const [unbanUser] = useMutation(UNBAN_USER);
  const [upgradeAdmin] = useMutation(UPGRADE_ADMIN);
  const [downgradeAdmin] = useMutation(DOWNGRADE_ADMIN);
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [isSecondDivVisible, setIsSecondDivVisible] = useState(false);
  let isAdmin = false;
  let isOwner = false;
  const [currentConversation, setCurrentConversation] = useState<Conversation | undefined>(conversation);
  const apolloClient = useApolloClient();

  useEffect(() => {
	setCurrentConversation(conversation);
  }, [conversation]);
  if (currentConversation?.admins?.find((user: any) => user.user.id === myUser.id))
    isAdmin = true;
  if (currentConversation?.owner?.id == myUser.id)
    isOwner = true;
	let users : User[] = [];
	const toggleModal = () => {
		setModal( !modal );
	};
	if (loading)
    Loading.current?.classList.remove("d-none"); // Show success alert
else
Loading.current?.classList.add("d-none"); // Show success alert
if (data)
{
	const currUser = data.users.find((user: any) => user.login42 === myUser.login42);
    users = data.users.filter((user: any) => user.login42 !== currUser.login42);
    const filteredUsers: User[] = users.filter((user: User) => {
		const loginWithoutSpaces: string = user.login42.replace(/\s/g, '').toLowerCase();
		const searchWithoutSpaces: string = groupName.replace(/\s/g, '').toLowerCase();
		return loginWithoutSpaces.includes(searchWithoutSpaces);
    });
    users = filteredUsers;
}
if (error)
{
	return <Logout />;
}
const handleGroupName = (event: React.ChangeEvent<HTMLInputElement>) => {
	setGroupName(event.target.value.replace(/\s/g, '').toLowerCase());
};

const handleAdminPad = (userId: number) => {
  if (selectedUserId === userId) {
    setIsSecondDivVisible(!isSecondDivVisible); // Bascule la visibilité
  } else {
    setSelectedUserId(userId); // Change l'utilisateur sélectionné
    setIsSecondDivVisible(true); // Affiche la deuxième div
  }
};

function handleKick (userId: number) {
	const res = kickUser({variables:{conversationId :currentConversation?.id, userId: userId}, context: {
		headers: {
			"Apollo-Require-Preflight": "true"
		}
	  }}).then(() =>{
		setCurrentConversation(prevState => {
			if (!prevState) return undefined; // Si prevState est undefined, nous le retournons tel quel.
			const updatedUsers = prevState?.users?.filter((user: any) => user.id !== userId);
			return {
			  ...prevState,
			  users: updatedUsers,
			  messages: prevState.messages || [],
			  __typename: prevState.__typename
			};
		  });
	  socket.emit('kick', {userId: userId, conversationId: currentConversation?.id});
  });
}

function handleMute (userId: number) {
	const res = muteUser({variables:{conversationId :currentConversation?.id, userId: userId}, context: {
		headers: {
			"Apollo-Require-Preflight": "true"
		}
	  }}).then(() =>{
        //currentConversation?.mutes?.push({user: currentConversation?.users?.find((user: any) => user.id === userId), mutedUntil: new Date(Date.now() + 60000)}); 
    	  // socket.emit('mute', {userId: userId, conversationId: currentConversation?.id});
  });
}

function handleUnBan (userId: number) {
	const res = unbanUser({variables:{conversationId :currentConversation?.id, userId: userId}, context: {
		headers: {
			"Apollo-Require-Preflight": "true"
		}
	  }}).then(() =>{
      currentConversation?.bannedUsers?.splice(currentConversation?.bannedUsers?.findIndex((user: any) => user.id === userId), 1);
      setCurrentConversation(currentConversation);
  });
}

const fetchUserData = async (senderId) => {
	const { data, error } = await apolloClient.query({
		query: GET_USER,
		variables: { userId: senderId },
	  });
	  if (error) {
		console.error("Erreur lors de la récupération du sender:", error);
		return;
	  }
	  return data.getUserById;
  };

useEffect(() => {
	socket.on('newUser', (data) => {
		console.log("newUser", data);
		if (data.conversationId === currentConversation?.id && !currentConversation?.users?.find((user: any) => user.id === data.userId)) {
			fetchUserData(data.userId).then((user) => {
				if (user) {
					const conv = JSON.parse(JSON.stringify(currentConversation));
					conv.users?.push(user);
					setCurrentConversation(conv);
				}
			});
		}
	});
  });

  useEffect(() => {
	socket.on('addUser', (data) => {
		console.log("addUser", data);
		if (data.conversationId === currentConversation?.id && !currentConversation?.users?.find((user: any) => user.id === data.userId)) {
			fetchUserData(data.userId).then((user) => {
				if (user) {
					const conv = JSON.parse(JSON.stringify(currentConversation));
					conv.users?.push(user);
					setCurrentConversation(conv);
				}
			});
		}
	});
  });

useEffect(() => {
    socket.on('kickUser', (data) => {
		if (currentConversation?.id === data.conversationId) {
            if (currentConversation?.users) {
				const index = currentConversation.users.findIndex((user: any) => user.id === data.userId);
				if (index !== -1) {
					const updatedUsers = [
						...currentConversation.users.slice(0, index),
						...currentConversation.users.slice(index + 1)
					];
					const updatedCurrentConversation = { ...currentConversation, users: updatedUsers };
					setCurrentConversation(updatedCurrentConversation);
				}
			}
		}
	});

    return () => {
        socket.off('kick');
    };
}, [currentConversation]);

function handleBan(userId: number) {
	const res = banUser({
		variables: {
			conversationId: currentConversation?.id,
			userId: userId
		},
		context: {
			headers: {
				"Apollo-Require-Preflight": "true"
			}
		}
	}).then(() => {
		let tmp = currentConversation; // Créez une copie de currentConversation
		const userToBan = tmp?.users?.find((user: any) => user.id === userId);
		if (userToBan && tmp) {
			const bannedUser: bannedUsers = {
				userBanned: userToBan
			};
			tmp.bannedUsers?.push(bannedUser);
			setCurrentConversation(tmp);
		}
	});
}

const handleAdd = (event: React.ChangeEvent<HTMLSelectElement>, userId: number) => {
  const res = addUser({variables:{conversationId : currentConversation?.id, userId}, context: {
    headers: {
        "Apollo-Require-Preflight": "true"
    }
  }}).then((data) => {
	socket.emit('addUser', {userId: userId, conversationId: currentConversation?.id});
  });
}

function handleUpgradeAdmin(userId: number) {
	const res = upgradeAdmin({variables:{conversationId :currentConversation?.id, userId: userId}, context: {
		headers: {
			"Apollo-Require-Preflight": "true"
		}
	  }}).then(() =>{
		socket.emit('setAdmin', {userId: userId, conversationId: currentConversation?.id});
	  });
}

function handleDowngradeAdmin(userId: number) {
	const res = downgradeAdmin({variables:{conversationId :currentConversation?.id, userId: userId}, context: {
		headers: {
			"Apollo-Require-Preflight": "true"
		}
	  }}).then(() =>{
		socket.emit('unsetAdmin', {userId: userId, conversationId: currentConversation?.id});
	  });
}

  return (
    <div className='right-pane'>
      {currentConversation && (currentConversation.admins?.find((user: any) => user.id === myUser.id || currentConversation.owner?.id === myUser.id)) &&
        <button className='btn btn-info mb-1 col-10' onClick={toggleModal}>Add to group</button>
      }
      {modal && currentConversation && (
        <div className="overlay" style={{
          left: "0",
          top: "0",
          width: "200%",
        }}>
          <div className="modal-content">
            <h2>Add to group</h2>
            <div className='choose container d-flex mt-2'>
              <p className='col-4'>login 42 :</p>
              <input type='text' className='col-8' value={groupName} onChange={handleGroupName}/>
              <p className='center d-none' ref={Loading}>Loading ...</p>
            </div>
            {data && groupName.length && users.length? (
                <div style={{overflow: 'auto'}}>
                {users.map((item: any) => (
                  <div className='user-item mt-2 truncate' key={item.id}>
                    <div className='container'>
                      <div className='row align-items-center border border-dark'>
                        <div className='col-md-4'>
                          <img className="card-img-top rounded-circle my-2" src={item.image} alt="..." />
                        </div>
                        <div className='col-md-8 container'>
                          <div className='col-12'>
                            {item.login42}
                          </div>
                          {
                            currentConversation?.users?.find((user: any) => user.id === item.id) ? (
                              <div className='col-12'>
                                <p style={{ color: 'red', margin: '0' }}>Already in {currentConversation.name}</p>
                              </div>
                            ) : 
                            <div className='col-12 mt-2'>
                            <button className="btn btn-outline-light" onClick={() => {handleAdd(this, item.id)}}>Add</button>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : ""}
            <div className='button-container'>
              <button className="alert" onClick={toggleModal}>CLOSE</button>
            </div>
          </div>
        </div>
      )}
      {currentConversation && currentConversation.users && 
        <div className='friends-list rounded pt-2'>
        {
          currentConversation.users.map((user: any) => (
            <div className='container' key={user.id} >
              <div className='friend-item container d-flex m-1 mx-auto border rounded' style={{ textOverflow: "ellipsis"}} onClick={() => handleAdminPad(user.id)}>
                <img className="rounded-circle my-2 col-6" style={{maxWidth: "35px"}} src={user.image} alt="..." />
                <p className='text-center col-6 my-auto d-none d-lg-block'>{user.login42}</p>
              </div>
              {selectedUserId == user.id && isSecondDivVisible && user.id != myUser.id &&  isAdmin && user.id != currentConversation.owner?.id&&(
                <div className='border container m-1 mx-auto d-flex' style={{ textOverflow: "ellipsis"}}>
                  {currentConversation?.admins?.find((userx: User) => userx.id === user.id) && isOwner?
                  <svg onClick={() => {handleDowngradeAdmin(user.id)}} xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-person-down col-3" viewBox="0 0 16 16">
                    <title>Downgrade to admin</title>
				              <path d="M12.5 9a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm.354 5.854 1.5-1.5a.5.5 0 0 0-.708-.708l-.646.647V10.5a.5.5 0 0 0-1 0v2.793l-.646-.647a.5.5 0 0 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                    <path d="M8.256 14a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1h5.256Z"/>
                  </svg>: <svg onClick={() => {handleUpgradeAdmin(user.id)}} xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="green" className="bi bi-person-fill-up col-3" viewBox="0 0 16 16">
                  <title>Upgrade to admin</title>
                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.354-5.854 1.5 1.5a.5.5 0 0 1-.708.708L13 11.707V14.5a.5.5 0 0 1-1 0v-2.793l-.646.647a.5.5 0 0 1-.708-.708l1.5-1.5a.5.5 0 0 1 .708 0ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                            <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z"/>
                          </svg> 
				  }
          {     <svg onClick={() => {handleBan(user.id)}} xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="red" className="bi bi-person-fill-slash col-3" viewBox="0 0 16 16">
                  <title>Bann user</title>
                  <path d="M13.879 10.414a2.501 2.501 0 0 0-3.465 3.465l3.465-3.465Zm.707.707-3.465 3.465a2.501 2.501 0 0 0 3.465-3.465Zm-4.56-1.096a3.5 3.5 0 1 1 4.949 4.95 3.5 3.5 0 0 1-4.95-4.95ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 8c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z"/>
                </svg> 
                  }
                  <svg onClick={() => {handleMute(user.id)}} xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-volume-mute-fill col-3" viewBox="0 0 16 16">
                    <title>Mute user</title>
					<path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                  <svg onClick={() => {handleKick(user.id)}} xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="red" className="bi bi-x-circle col-3" viewBox="0 0 16 16">
					<title>Kick user</title>
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
				  </div>
              )}
            </div>
          ))
        }
        </div>
      }
    </div>
  );
};


/******************************************************************** */
/******************************** CHAT ****************************** */
/******************************************************************** */


function Chat() {	
  if (!useUser())
  {
    window.location.replace("/");
    return null;
  }
  const apolloClient = useApolloClient();
  const [modal, setModal] = useState (false);
  const [modalChat, setModalChat] = useState (false);
  const [modalEdit, setModalEdit] = useState (false);
  const [modalProfil, setModalProfil] = useState (false);
  const [searchModal, setSearchModal] = useState (false);
  const [modeConv, setmodeConv] = useState (false);
  const [TheConversation, setTheConversation] = useState <Conversation | undefined>();
  const [type, setType] = useState ('public');
  const [password, setPassword] = useState ('');
  const [groupName, setGroupName] = useState ('');
  const [MP, setMP] = useState ('');
  const [createConv] = useMutation(CREATE_CONVERSATIONS);
  const [updateConv] = useMutation(UPDATE_CONV);
  const [createMP] = useMutation(CREATE_DISCUSSION);
  const [searchConversation, setSearchConversation] = useState<Conversation[] | undefined>();
  const [searchConv] = useMutation(SEARCH_CONV, {onCompleted: data => {setSearchConversation(data.searchConversation);}});
  const [searchUser] = useMutation(SEARSH_USER);
  const [joinConv] = useMutation(JOIN_CONV);
  const [quit] = useMutation(QUIT_CONV);
  const { data } = useQuery(GET_BLOCK);
  const [modeUnban, setModeUnban] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [chatList, setChatList] = useState<Conversation[]>([]);
  const [Games, setGames] = useState<Game[]>([]);
  const [messages, setMessages] = useState<MessageProps[] | undefined>();
  const firstMessageRef = useRef<HTMLDivElement>(null);
  const [chatListSetted, setChatListSetted] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user") as string);
	const conversations = Conversations();
	const discussions = Discussions();
  const [profil, setProfil] = useState<User>();
  const [searchUsers, setSearchUsers] = useState<User[]>();
  const [FID, setFID] = useState(0);
  const [getconv] = useMutation(GET_CONV_MSG);
  const [winPercentage, setWinPercentage] = useState(0);
  const [getGames] = useMutation(GAMES_BY_ID);
  const [getDiscu] = useMutation(GET_DISCUSSION);
  const successRef = useRef<HTMLInputElement | null>(null);
  const failRef = useRef<HTMLInputElement | null>(null);
  const BadPassRef = useRef<HTMLInputElement | null>(null);
  const [unbanUser] = useMutation(UNBAN_USER);
  const navigate = useNavigate();
  const [ nav, setNav ] = useState<number>(0);

  useEffect(() => {
    if (nav === 1)
      navigate("/gamecustom");
  }, [nav])

  // const [blocked, setBlocked] = useState();

  socket.connect();
	
	function filtrMsg(oldmsg : MessageProps[] | undefined, newConv: boolean = true) 
	{
		if (oldmsg === undefined)
      return;
    else
    {
	  let newMessage: MessageProps | undefined = oldmsg[oldmsg.length - 1];
      const blockedUserIds = data.getBlocked.map(user => user.id);
      setMessages(prevMessages => {
		if (!prevMessages) return oldmsg;
		newMessage = (blockedUserIds.includes(newMessage?.sender?.id) ? undefined : newMessage)
		const filteredMessages = (newConv ?  oldmsg.filter(message => !blockedUserIds.includes(message.sender?.id)) : prevMessages.filter(message => !blockedUserIds.includes(message.sender?.id)));
		if (newMessage && !newConv)
			return [...filteredMessages, newMessage];
		return filteredMessages;
	});
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchSenderData = async (senderId) => {
	  const { data, error } = await apolloClient.query({
		  query: GET_USER,
		  variables: { userId: senderId },
		});
		if (error) {
		  console.error("Erreur lors de la récupération du sender:", error);
		  return;
		}
		return data.getUserById;
	};

	const handleNewMessage = (data, eventType) => {
		fetchSenderData(data.senderId).then((userSender) => {
		  const message: MessageProps = {
			id: data.id,
			sender: userSender,
			content: data.content,
			date: new Date(),
		  };
		var chat: Conversation | undefined;
		if (eventType === 'chatToConversation')
			chat = chatList.find((chat) => chat.id === data.conversationId && chat.__typename === 'conversation');
		else if (eventType === 'chatToDiscussion')
			chat = chatList.find((chat) => chat.id === data.discussionId && chat.__typename === 'discussion');
		if (chat) {
			let channels = [...chatList];
			const chatIndex = channels.indexOf(chat);
			const updatedChat = { ...channels[chatIndex] };
			updatedChat.messages = [message];
			channels[chatIndex] = updatedChat;
			channels.sort((a, b) => {
			  const dateA = new Date(a.messages[0].date);
			  const dateB = new Date(b.messages[0].date);
			  return dateB.getTime() - dateA.getTime();
			});
			setChatList(channels);
			if (messages) {
				const updatedMessages = [...messages, message];
				filtrMsg(updatedMessages, false);
			}
		}	  
		});
	  };

    const handleNewInvitation = (data) => {
      console.log("received invitation");
      fetchSenderData(data.senderId).then((userSender) => {
        const message: MessageProps = {
        id: data.id,
        sender: userSender,
        content: data.content,
        date: new Date(),
        type: "Invitation",
        };
      var chat: Conversation | undefined;

      chat = chatList.find((chat) => chat.id === data.discussionId && chat.__typename === 'discussion');
      if (chat) {
        let channels = [...chatList];
        const chatIndex = channels.indexOf(chat);
        const updatedChat = { ...channels[chatIndex] };
        updatedChat.messages = [message];
        channels[chatIndex] = updatedChat;
        channels.sort((a, b) => {
          const dateA = new Date(a.messages[0].date);
          const dateB = new Date(b.messages[0].date);
          return dateB.getTime() - dateA.getTime();
        });
        setChatList(channels);
        if (messages) {
          const updatedMessages = [...messages, message];
          filtrMsg(updatedMessages, false);
        }
      }	  
      });
      };

	  const conversationListener = (data) => {
		handleNewMessage(data, 'chatToConversation');
	  };

	  const discussionListener = (data) => {
		handleNewMessage(data, 'chatToDiscussion');
	  };

  useEffect(() => {
  socket.on('chatToConversation', conversationListener);
  socket.on('chatToDiscussion', discussionListener);
  socket.on('gameInvitation', handleNewInvitation);
  return () => {
    socket.off('chatToConversation');
    socket.off('chatToDiscussion');
    socket.off('gameInvitation');
  };
}, [TheConversation]); 


	useEffect(() => {
    if (conversations && !conversations.loading && !conversations.error && discussions && !discussions.loading && !discussions.error && !chatListSetted) {
      const combinedConversations = [...conversations.data.getAllUserConversations];
    	const combinedDiscussions = discussions.data.getAllUserDiscussions.map((discussion: any) => {
        let otherParticipant = (discussion.participant1.id === user.id) ? discussion.participant2 : discussion.participant1;
        return {
          ...discussion,
          name: `${otherParticipant.first_name} ${otherParticipant.last_name}`,
        };
      });
      // Fusionner les discussions et les conversations en un seul tableau
      const combined = [...combinedDiscussions, ...combinedConversations];
      combined.sort((a, b) => {
        const dateA = new Date(a.messages[0].date);
			  const dateB = new Date(b.messages[0].date);
			  return dateB.getTime() - dateA.getTime();
			});
      setChatList(combined);
      if (combined.length > 0 && combined[0].__typename === 'conversation') {
        setmodeConv(true);
        setFID(+combined[0].id);
		    socket.emit('joinConversation', {userId: user.id, conversationId: combined[0].id});
      }
      if (combined.length > 0 && combined[0].__typename === 'discussion') {
        setmodeConv(false);
        setFID(+combined[0].id);
		socket.emit('joinDiscussion', {userId: user.id, discussionId: combined[0].id});
      }
      setChatListSetted(true);
    }
  }, [conversations, discussions]);

  useEffect(() => {
    if (FID !== 0) {
      if(modeConv)
      {
		    const res = getconv({variables:{idConversation : FID}, context: {
          headers: {
              "Apollo-Require-Preflight": "true"
          }}}).then((data) => {
            if (data.data.findOne)
            {
              const convDataSort = JSON.parse(JSON.stringify(data.data));
              convDataSort.findOne.messages.sort((a: MessageProps, b: MessageProps) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA.getTime() - dateB.getTime();
              });
              filtrMsg(convDataSort.findOne.messages);
              setTheConversation(convDataSort.findOne);
              }
          });
      }
      else if (modeConv === false)
      {
        const res = getDiscu({variables:{userId : FID}, context: {
          headers: {
              "Apollo-Require-Preflight": "true"
          }}}).then((data) => {
            if (data.data.getDiscussionById)
            {
              const convDataSort = JSON.parse(JSON.stringify(data.data));
              convDataSort.getDiscussionById.messages.sort((a: MessageProps, b: MessageProps) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA.getTime() - dateB.getTime();
              });
              filtrMsg(convDataSort.getDiscussionById.messages);
              setTheConversation(convDataSort.getDiscussionById);
              }
          });
      }
    }
  }, [modeConv, FID]);

  useEffect(() => {
    socket.on('kick', (data) => {
        if (data.userId === user.id) {
            const updatedChatList = chatList.filter(chat => !(chat.id === data.conversationId && chat.__typename === 'conversation'));
            setChatList(updatedChatList);
            if (data.conversationId === FID) {
				if (chatList.length <= 0) {
					socket.emit('leaveConversation', {userId: user.id ,conversationId: TheConversation?.id});
                	setFID(0);
					setmodeConv(false);
				}
				changeRoom(chatList[1].id, chatList[0].__typename)
                setFID(chatList[1].id);
				setmodeConv(chatList[1].__typename === 'conversation' ? true : false);
            }
        }
    });
    return () => {
        socket.off('kick');
    };
}, [chatList, FID, user.id, socket]);

  useEffect(() => {
    if (firstMessageRef.current) {
      firstMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [firstMessageRef]);

  useEffect(() => {
    if (profil)
    {
      const res = getGames({variables:{userId : +profil?.id, take : 20}, context: {
        headers: {
            "Apollo-Require-Preflight": "true"
        }}}).then((data) => {

          const gamedata = data.data.Games;

          console.log(profil);

          if (gamedata.length > 0)
          {
            const totalGames = gamedata.length;

            let totalWins = 0;

            for (const game of gamedata) {

              if (game.winnerId === profil.id)
                totalWins++;
            }
            const percentage = (totalWins / totalGames) * 100;
            setWinPercentage(percentage);
            setGames(gamedata);
          }
        });
    }
  }, [profil]);

  useEffect(() => {
	socket.on('joinConv', (data) => {
		handleJoin(data.conversationId, 'public', false);
	});
	return () => {
		socket.off('joinConv');
	  };
  });

  const handleQuit = (event) => {
    const res = quit({variables:{conversationId : TheConversation?.id}, context: {
      headers: {
        "Apollo-Require-Preflight": "true"
      }
      }}).then(() => {
        chatList.splice(chatList.findIndex((chat) => {
          return chat.id === TheConversation?.id
        }), 1);
		socket.emit('kick', {userId: user.id, conversationId: TheConversation?.id});
        setChatList(chatList);
		changeRoom(chatList[0].id, chatList[0].__typename);
        setFID(chatList[0].id);
      });
  }

  
  function handleUnBan(userId: number) {
    const res = unbanUser({
        variables: { conversationId: TheConversation?.id, userId: userId },
        context: {
            headers: {
                "Apollo-Require-Preflight": "true"
            }
        }
    }).then(() => {
        let bannedUserObject = TheConversation?.bannedUsers?.find((user: bannedUsers) => user.userBanned.id === userId);
        if (bannedUserObject && TheConversation?.users) {
            TheConversation.users.push(bannedUserObject.userBanned);
        }
        const bannedUserIndex = TheConversation?.bannedUsers?.findIndex((user: bannedUsers) => user.userBanned.id === userId);
        if (bannedUserIndex !== undefined && bannedUserIndex > -1) {
            TheConversation?.bannedUsers?.splice(bannedUserIndex, 1);
        }
        setTheConversation(TheConversation);
    });
}

  const toggleModal = () => {
    setModal( !modal );
  };

  const toggleModalChat = () => {
    setModalChat( !modalChat );
  };

  const toggleModalEdit = () => {
    setModalEdit( !modalEdit );
  };

  const toggleModalProfil = () => {
    setModalProfil( !modalProfil );
  };

  const toggleSearchModal = () => {
    setSearchModal( !searchModal );
  };

  const handleGroupName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(event.target.value);
  };

  const handleMP = (event: React.ChangeEvent<HTMLInputElement>) => {
    const login = event.target.value;
    if (login.length >= 3)
    {
      const res = searchUser({variables:{login}, context: {
        headers: {
            "Apollo-Require-Preflight": "true"
        }}}).then((data) => {
          if (data.data.SearchUsers.length > 0) {
            let tmp: User[] = [...data.data.SearchUsers];
          
            const indexToRemove = data.data.SearchUsers.findIndex((userx: User) => userx.id === user.id);
          
            if (indexToRemove !== -1) {
              data.data.SearchUsers.splice(indexToRemove, 1);
            }
            setSearchUsers(data.data.SearchUsers);
          }
        });
    }
  };

  const handleSearchInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // setSearchVal();
    let name : string = event.target.value;
    if (name.length >= 3)
    {
      const res = await searchConv({variables:{name : event.target.value}, context: {
        headers: {
            "Apollo-Require-Preflight": "true"
        }
      }}).then((data) => {
        //console.log("data", data);
        if (data.data.searchConversation.length > 0)
        {
           setSearchConversation(data.data.searchConversation);
           //console.log("searchConversation", searchConversation);
        }
      });
    }
  };

  const handleType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value);
  };

  const handleModeUnban = () => {
    setModeUnban(!modeUnban);
  };

  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  
  const handleCreateChat = () => {
    const newConv = createConv({variables:{name : groupName, type, password}, context: {
      headers: {
          "Apollo-Require-Preflight": "true"
      }
    }}).then((data) => {
		//console.log("data", data);
      // const chatName = groupName || 'New Chat';
      setPassword('');
      setChatList([data.data.createConversation, ...chatList]);
	  changeRoom(data.data.createConversation.id, 'conversation');
	    setFID(data.data.createConversation.id);
      toggleModal();
    }).catch(() =>{
      //console.log("ERROR");
    });
  };

  const handleUpdateConv = () => {
    const newConv = updateConv({variables:{idConversation : TheConversation?.id, type, password}, context: {
      headers: {
          "Apollo-Require-Preflight": "true"
      }
    }}).then((data) => {
		  console.log("data", data);
      setPassword('');
      successRef.current?.classList.remove("d-none"); // Show success alert
      failRef.current?.classList.add("d-none"); // Hide failure alert
      setTimeout(() => {
        if(modalEdit)
           toggleModalEdit();
    }, 2000);
    }).catch(() =>{
      console.log("ERROR");
      successRef.current?.classList.add("d-none"); // Show success alert
      failRef.current?.classList.remove("d-none"); // Hide failure alert
    });
  };

    const handleJoin = (conversationId : number, type : string, setModal = true) => {
    const join = joinConv({variables:{conversationId : conversationId, type, password}, context: {
      headers: {
          "Apollo-Require-Preflight": "true"
      }
    }}).then((data) => {
      if (data)
      {
        setChatList([data.data.JoinConversation , ...chatList]);
		changeRoom(conversationId, 'conversation', true);
        setFID(conversationId);
		if (setModal)
        	toggleSearchModal();
      }
    }).catch((e) =>{
      BadPassRef.current?.classList.remove("d-none"); 
      setTimeout(() => {
        BadPassRef.current?.classList.add("d-none");
        }, 5000);
    });
  };

  const handleChatListFromChatFriends = (chatList: Conversation[]) => {
	//console.log("chatList", chatList);
	setChatList(chatList);
	//console.log("chatListAfter", chatList);
  };

  function handleCreateMP (userId: number) {
    const newMP = createMP({variables:{userId}, context: {
      headers: {
          "Apollo-Require-Preflight": "true"
      }
    }}).then((data) => {
      //console.log("data iciciicicici", data);
      setChatList([...chatList, data.data.createDiscussion]);
      toggleModal();
    }).catch(() =>{
      //console.log("ERROR");
    });
  };

  const changeRoom = (id: number, typename: string, isNewUser = false) => {
	if (id === 0){
		setFID(0);
		return;
	}
    if (modeConv)
      	socket.emit('leaveConversation', {userId: user.id ,conversationId: TheConversation?.id});
    else
		socket.emit('leaveDiscussion', {userId: user.id ,discussionId: TheConversation?.id});
	if (typename === 'conversation'){
		socket.emit('joinConversation', {userId: user.id ,conversationId: id, isNewUser: isNewUser});
		setmodeConv(true);
	}
    else if (typename === 'discussion') {
		socket.emit('joinDiscussion', {userId: user.id ,discussionId: id});
		setmodeConv(false);
	}
	setFID(id);
  };

  const sendInvitation = (senderlog: string, receiverlog: string, discussionId: number | undefined, my_id: number) => {

        socket.emit('gameInvitation', {userId: my_id, discussionId: discussionId, message: senderlog});
        socket.emit('sendCustomInvite', {roomlogin: senderlog, login: receiverlog});
        setNav(1);
  };

  return (
    <div id="chat" className={chatListSetted && modeConv && TheConversation ? "container glass-chat-panel-half pt-1" : "container glass-chat-panel pt-1"}>
{searchModal &&(
    <div className="overlay">
      <div className="modal-content">
        <h2>Search group</h2>
        <div className='choose container d-flex mt-2'>
          <input type='text' className='col-12' onChange={handleSearchInput}/>
        </div>
        {searchConversation != undefined && (
          <div style={{ overflow: 'auto', maxHeight: "600px" }} className='container mt-1'>
            {searchConversation.map((item: Conversation) => (
              <div className='row border mt-1 container mx-auto' key={item.id}>
                <div className='col-12 text-center'>
                  {item.name}
                </div>
                <div className='col-6 text-center'>
                  <p>{item.users?.length} member(s)</p>
                </div>
                <div className='col-6 text-center'>
                  {item?.type === 'public' ? (
                    <p style={{ color: 'green', margin: '0' }}>Public</p>
                  ) : (
                    <p style={{ color: 'red', margin: '0' }}>Private</p>
                  )}
                </div>
                {item?.type == 'protected' ?
                <>
                  {/* <div className='col-6 left'> */}
                    <button className="col-6 new-chat-button" onClick={() => {handleJoin(item.id, item.type ? item.type : "public")}} >Join</button>
                  {/* </div> */}
                  <div className='col-6 left'>
                    <input type='text' placeholder='password' onChange={(e) => {setPassword(e.currentTarget.value)}}/>
                  </div>
                  <div className="alert alert-danger col-10 mx-auto mt-1 d-none" role="alert" ref={BadPassRef}>Access denied</div>
                </>
                :
                <>
                  <button className="col-12 new-chat-button" onClick={() => {handleJoin(item.id, item.type ? item.type : "public")}}>Join</button>
                </>}
              </div>
            ))}
          </div>
        )}
        <div className='button-container'>
          <button className="alert" onClick={toggleSearchModal}>CLOSE</button>
        </div>
      </div>
    </div>
  )}



  {modal &&(
    <div className="overlay">
      <div className="modal-content">
        <h2>Create new chat</h2>
        <div className='choose d-flex justify-content-around'>
          <p>Name: </p>
          <input type='text' value={groupName} onChange={handleGroupName}/>
        </div>
        <div className='choose mt-3'>
          <div className="input-group mb-3">
            <label className="input-group-text" htmlFor="inputGroupSelect01-+">Confidentiality :</label>
            <select className="form-select" onChange={handleType}>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="protected">Protected</option>
            </select>
          </div>
        </div>
        {type == 'protected' &&
        <div className='choose d-flex justify-content-around'>
          <p>Password: </p>
          <input type='text' value={password} onChange={handlePassword}/>
        </div>}
        <div className='button-container'>
          <button className="alert" onClick={toggleModal}>CLOSE</button>
          <button className="success" onClick={handleCreateChat}>OK</button>
        </div>
      </div>
    </div>
  )}

  
  {modalEdit &&(
    <div className="overlay">
      <div className="modal-content">
        <h2>Edit {TheConversation?.name}</h2>
        <div className='choose mt-3'>
          <div className="input-group mb-3">
            <label className="input-group-text" htmlFor="inputGroupSelect01-+">Confidentiality :</label>
            <select className="form-select" onChange={handleType}>
              <option value="public">Public</option>
              <option value="private" >Private</option>
              <option value="protected">Protected</option>
            </select>
          </div>
        </div>
        {type == 'protected' &&
        <div className='choose d-flex justify-content-around'>
          <p className='my-auto mx-1'>Password: </p>
          <input type='text' onChange={handlePassword}/>
        </div>}
        <div className='button-container'>
          <button className="alert" onClick={toggleModalEdit}>CLOSE</button>
          <button className="success" onClick={handleUpdateConv}>SAVE</button>
        </div>
        <div className="alert alert-success col-10 mx-auto mt-3 d-none" role="alert" ref={successRef}>Success</div>
        <div className="alert alert-danger col-10 mx-auto mt-3 d-none" role="alert" ref={failRef}>Update failed please try later</div>
      </div>
    </div>
  )}

  {modalChat &&(
    <div className="overlay">
      <div className="modal-content">
        <div className='choose d-flex justify-content-around'>
          <input type='text' onChange={handleMP} placeholder='login'/>
        </div>
        {searchUsers && (
      <div style={{overflow: 'auto'}}>
      {searchUsers.map((item: any) => (
        <div className='user-item mt-2 truncate' key={item.id}>
          <div className='container'>
            <div className='row align-items-center border border-dark'>
              <div className='col-md-4'>
                <img className="card-img-top rounded-circle my-2" src={item.image} alt="..." />
              </div>
              <div className='col-md-8 container'>
                <div className='col-12'>
                  {item.login42}
                </div>
                  <div className='col-12 mt-2'>
                  <button className="btn btn-outline-light" onClick={() => {handleCreateMP(item.id)}}>Private Message</button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      </div>
        )}
        <div className='button-container'>
          <button className="alert" onClick={toggleModalChat}>CLOSE</button>
        </div>
      </div>
    </div>
  )}

  
  {modalProfil === true && profil && (
    <div className="overlay container">
      <div className="modal-content container">
        {profil.discussionId && profil.discussionId !== -1 && (
          <button onClick={() => sendInvitation(user.login42, profil.login42, profil.discussionId, user.id)}>Send Invitation</button>
        )}
        <div className='row'>
          <div className='col-4'>
            <img className="card-img-top rounded-circle my-2" src={profil?.image} alt="..." />
          </div>
          <div className='col-8 my-auto font-weight-bold text-center' style={{fontSize: "2vh"}}>
          {profil?.login}
          </div>
        </div>
        <div>
          <h2>Games History</h2>
          <div className='container overflow-auto'>
          <div className='container'>
            {winPercentage ? winPercentage.toFixed(2)+"% of win" : "N/A"}
          </div>
            {Games && Games.map((game: Game) => (
              <div className='row border mt-1 container mx-auto' key={game.id}>
                <div className='col-4 text-center'>
                  {game.player1.login}
                </div>
                <div className='col-4 text-center'>
                  {game.winnerId == profil.id ? 
                  <div style={{color: "green"}}>WIN</div> : <div style={{color: "red"}}>LOSE</div>}
                </div>
                <div className='col-4 text-center'>
                  {game.player2.login}
                </div>
                </div>
            ))}
          </div>
        </div>
        <button className="alert btn" onClick={toggleModalProfil}>CLOSE</button>
      </div>
    </div>
    )}
      {/*<div className="d-flex container">*/}
        <div className='left'>
          <div className="left-pane">
                  <button className="button-pm" onClick={toggleModalChat}>New PM</button>
                  <button className="button-chat" onClick={toggleModal}>New chat</button>
                  <button className="button-group" onClick={toggleSearchModal}>Search Group</button>
            </div>
            

            {/* <div className=""> */}
              <div className='rounded chat-list overflow-auto '>
                {chatList && chatList.map((chat, index) => (
                  <div className='col-11 mx-auto my-1' key={index} onClick={(e) => {changeRoom(chat.id, chat.__typename);}}>
                    <div className='container'>
                      <div className='row align-items-center border border-dark rounded'>
                        {chat.__typename == "discussion" && 
                        <>
                          <div className='user-item truncate'>
                              <div className='align-items-center d-flex container'>
                                <div className='col-md-3 col-sm-2'>
                                  <img className="card-img-top rounded-circle my-2" src={chat.participant1?.id == user.id ? chat.participant2?.image : chat.participant1?.image} alt="..." />
                                </div>
                                <div className='col-8'>
                                    {chat.participant1?.id === user.id ? chat.participant2?.login42 : chat.participant1?.login42} 
                                </div>
                              </div>
                          </div>
                        </>
                        }
                        {chat.__typename == "conversation" && (<><div className='col-8'>
                          <p className="text-center mt-1" id={String(chat.id)}>{chat.name}</p>
                        </div>
                        <div className='col-4'>
                          <p className="text-center mt-1">
                          {chat?.owner?.id === user.id && <strong style={{color: 'red'}}>O</strong>}
                          {chat?.owner?.id !== user.id && TheConversation?.admins?.find((userx: User) => userx.id === user.id) && <strong style={{color: 'red'}}>A</strong>}
                          {chat?.owner?.id !== user.id && !TheConversation?.admins?.find((userx: User) => userx.id === user.id) && <strong style={{color: 'blue'}}>M</strong>}
                          </p>
                        </div>
                        {chat.messages[0] &&
                          <div className='col-12 ml-0' style={{}}>
                            {(chat.messages[0].sender?.login) ? chat.messages[0].sender.login : chat.messages[0].sender?.login42}: {chat.messages[0].content.length > 12 ? chat.messages[0].content.replace(chat.messages[0].content.substring(11), '...') : chat.messages[0].content}
                          </div>
                        }</>)}
                        
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            {/* </div> */}
          </div>
      {messages?.length? 
          (
          <div className={chatListSetted && modeConv && TheConversation ? 'message-half' : 'message-full'}>
            <div className='d-flex justify-content-center'>
			          {TheConversation? (<h1>{TheConversation.name}</h1>) : ""}
                {TheConversation?.owner?.id == user.id && 
                <div>
                  <button onClick={toggleModalEdit} className="btn"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
</svg></button>
                </div>
                }
            </div>
            <div className='message-zone container '>
              <div className='overflow-auto mb-1'>
              {messages?.map((message, index) => (
                <div ref={index === 0 ? firstMessageRef : null} className="row container d-flex border border-dark rounded justify-content-start card-msg mx-auto h-auto" key={index}>
                  <div className='col-2' onClick={() =>{
                      const updatedProfil: any = {
                        ...message.sender,
                        discussionId: modeConv ? -1 : TheConversation?.id,
                      };
                      setProfil(updatedProfil);
                      toggleModalProfil();
                    }}>
                    <img className="rounded-circle my-2 card-msg-img" src={message.sender?.image} alt="..." />
                  </div>
                  <div className='text-start col-10'>
                    {message.type && message.type === "Invitation" ?
                      <NavLink to={`/joincustom?room=${message.content}`}>
                      <div className='glass-invitation'>
                        <div>Join {message.sender?.login ? message.sender.login : ''} Game</div>
                      </div>
                    </NavLink> :
                      <p><strong>{message.sender?.login ? message.sender.login.toUpperCase() : message.sender?.login42.toUpperCase()}</strong>: {message.content}</p>
                    }
                  </div>
                </div>
              ))}
			  <div ref={messagesEndRef}></div>
              </div>
              {!TheConversation?.mutes?.find((userx: mutedUsers) => (userx.user?.id === user.id && userx.mutedUntil?.getDate() > Date.now())) && <SendMessage idConversation={FID} idUser={user.id} modeConv={modeConv}/>}
            </div>
          </div>
        ) :
         (
          <div className={chatListSetted && modeConv && TheConversation ? 'message-half' : 'message-full'}>
            <div className='message-zone'>
              No msg
              <SendMessage idConversation={FID} idUser={user.id} modeConv={modeConv}/>
            </div>
          </div>
        )
      } 
            {chatListSetted && modeConv && TheConversation &&
            <div className='rightmodal'>
              <div className='col-12'>
               {user.id !== TheConversation?.owner?.id && <button className='btn btn-danger' onClick={handleQuit}>Quit group</button>}
              </div>
              <div className='col-12'>
              {modeUnban === true && TheConversation.bannedUsers &&(
                <div className='col-12'>
                  {TheConversation.bannedUsers.map((user, index) => (
                    <div className='container' key={index}>
                      <div className='friend-item container d-flex m-1 mx-auto border rounded' style={{ textOverflow: "ellipsis"}}>
                        <img className="rounded-circle my-2 col-6" style={{maxWidth: "35px"}} src={user.userBanned.image} alt="..." />
                        <p className='text-center col-6 my-auto d-none d-lg-block'>{user.userBanned.login42}</p>
                        <svg onClick={() => {handleUnBan(user.userBanned.id)}} xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-person-fill-slash col-3" viewBox="0 0 16 16">
                          <title>unban user</title>
                          <path d="M13.879 10.414a2.501 2.501 0 0 0-3.465 3.465l3.465-3.465Zm.707.707-3.465 3.465a2.501 2.501 0 0 0 3.465-3.465Zm-4.56-1.096a3.5 3.5 0 1 1 4.949 4.95 3.5 3.5 0 0 1-4.95-4.95ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 8c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {modeUnban === false && 
                  <ChatFriends conversation={TheConversation} chatList={chatList} handleChatListFromChatFriends={handleChatListFromChatFriends} />
              }
              </div>
              <div className='col-12 my-2'>
                <button className='btn btn-outline-danger' onClick={() => { handleModeUnban() }}>Ban list</button>
              </div>
            </div>}
          {/*</div>*/}
        </div>
  )
}

export default Chat