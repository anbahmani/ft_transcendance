import { gql } from '@apollo/client';

export const GET_USER = gql(`
  query ($userId: Int!) {
    getUserById(userId: $userId) {
      id
	  login
      login42
      first_name
      last_name
      image
    }
  }
`);

export const BLOCK_USER = gql(`
  mutation ($userId: Int!) {
    blockUser(userId: $userId) {
      blockerId,
      blockedUser
    }
  }
`);

export const UNBLOCK_USER = gql(`
  mutation ($userId: Int!) {
    removeBlockedUser(userId: $userId) {
      blockerId,
      blockedUser
    }
  }
`);

export const FORMAT_LIST_BLOCK = gql(`
  query {
    formatListBlock {
      id,
      admin
    }
  }
`);

export const GET_BLOCK = gql(`
query GetBlocked {
  getBlocked {
    id
  }
}
`);

export const  AUTH_QUERY =  gql(`
query ($code: String){
  auth(code : $code){
    id,
    first_name,
    last_name,
    login42,
    image,
    login,
    email,
    isVerified,
    token 
  }
}
`);

export const updateUser = gql(`
mutation ($login: String, $file: Upload){
  updateUser(login : $login, file: $file){
    first_name,
    last_name,
    login42,
    login,
    image,
    email,
    isVerified,
    token
  }
}
`);

export const  GET_CONV_MSG =  gql(`
mutation FindOne($idConversation: Float!) {
  findOne(idConversation: $idConversation) {
    admins {
      user {
        id
        image
        login
        login42
      }
    }
    members {
      user {
        id
        image
        login
        login42
      }
    }
    mutes {
      user {
        id
      }
      mutedUntil
    }
    bannedUsers {
      userBanned {
        id
        image
        login
        login42
      }
    }
    id
    name
    type
    users {
      image
      id
      login
      login42
    }
    owner {
      id
      image
      login
      login42
    }
    messages {
      content
      date
      id
      sender {
        id
        image
        login42
        login
      }
    }
  }
}
`);

export const updateUserEm = gql(`
mutation ($login: String, $email: String, $file: Upload){
  updateUser(login : $login, file: $file, email: $email){
    first_name,
    last_name,
    login42,
    login,
    image,
    email,
    isVerified,
    token
  }
}
`);

export const FAValidate = gql(`
mutation ($code: String, $email: String) {
  F2aValidate(code: $code, email: $email) {
    first_name,
    last_name,
    login42,
    image,
    login,
    email,
    isVerified,
    token
  }
}
`);

export const activate2Fa = gql(`
mutation {
  activate2Fa {
    email,
    isVerified,
  }
}
`);

export const GET_ALL_CONVERSATIONS = gql`
  query {
    getAllUserConversations {
	    id
      name
      owner {
        id
        login
        login42
        image
      }
      messages {
        content
        id
        date
        sender {
          id
          login
          login42
          image
        }
      }
    }
  }
`;

export const SEARCH_CONV = gql`
mutation($name: String!) {
  searchConversation(name: $name) {
    id
    name
    type
    owner {
      id
    }
    messages {
      content
      id
      date
      sender {
        id
        login
        login42
        image
      }
    }
    users {
      id
      image
      login
      login42
    }
  }
}
`;

export const SEARSH_USER = gql(`
mutation SearchUsers($login: String!) {
  SearchUsers(login: $login) {
    id
    login
    login42
    image
  }
}
`);

export const CREATE_DISCUSSION = gql(`
mutation ($userId: Float!) {
  createDiscussion(userId: $userId) {
    id
    messages {
      content
      date
      id
      sender {
        id
        image
        login
        login42
      }
    }
    participant1 {
      id
      image
      login
      login42
    }
    participant2 {
      id
      login
      login42
      image
    }
  }
}
`);

export const GET_DISCUSSION = gql(`
mutation ($userId: Float!) {
  getDiscussionById(id: $userId) {
    id
    participant1 {
      id
      login
      login42
      image
    }
    participant2 {
      id
      login
      login42
      image
    }
    messages {
      id
      sender {
        id
        image
        login
        login42
      }
	  type
      date
      content
    }
  }
}
`);

export const CREATE_CONVERSATIONS = gql`
  mutation($name: String!, $password: String!, $type: String!) {
    createConversation (name: $name, password: $password, type: $type){
      id
      members {
        user {
          id
          image
          login
          login42
        }
      }
      admins {
        user {
          id
          login
          login42
          image
        }
      }
      messages {
        content
        date
        id
        sender {
          id
          id42
          login
          login42
        }
      }
      mutes {
        user {
          id
        }
        mutedUntil
      }
      bannedUsers {
        userBanned {
          id
          image
          login
          login42
        }
      }
      name
      owner {
        id
        image
        login
        login42
      }
    }
  }
`;

export const ADD_TO_CONV = gql(`
  mutation ($conversationId: Int!, $userId: Int!) {
    AddUserToConversation(conversationId: $conversationId, userId: $userId) {
      id
    }
  }
`);

export const GET_ALL_DISCUSSIONS = gql`
  query {
    getAllUserDiscussions {
	  id
      participant1{
        id
        login
        login42
        first_name
        last_name
        image
	  }
	  participant2{
		id
    login
    login42
		first_name
		last_name
    image
	  }
	  messages{
		content
		date
		type
    sender{
      id
      login
      login42
      image
    }
	  }
    }
  }
`;

export const GET_ALL_USERS = gql(`
  query GetAllUsers {
    users {
      id
      login42
      first_name
      last_name
      image
      follow {
        id
        status
        owner {
          id
          first_name
          last_name
          image
        }
        receiver {
          id
          first_name
          last_name
          image
        }
      }
    }
  }
`)

export const USERS = gql(`
  query GetAllUsers {
    users {
      id
      login42
      first_name
      last_name
      image
    }
  }
`)

export const SEND_FRIEND_REQUEST = gql(`
  mutation SendFriendRequest($userId: Int!) {
    createFriendship(userId: $userId) {
      id
      status
      ownerId
      receiverId
    }
  }
`)

export const CREATE_FRIENDSHIP = gql(`
  mutation CreateFriendship($userId: Int!) {
    createFriendship(userId: $userId) {
      id
      status
      ownerId
      receiverId
    }
  }
`)

export const SUB_CREATE_FRIENDSHIP = gql(`
  subscription CreatedFriendship {
    createFriendship {
      id
      status
      ownerId
      receiverId
    }
  }
`)

export const LIST_FRIENDSHIPS = gql(`
  query ListFriendships {
    findAll {
      id
      status
      ownerId
      receiverId
    }
  }
`)

export const UPDATE_FRIENDSHIP = gql(`
  mutation updateFriend($status: String!, $id: Int!) {
    updateFriendship(status: $status, id: $id) {
      id
      status
      ownerId
      receiverId
    }
  }
`)


export const DELETE_FRIENDSHIP = gql(`
  mutation DeleteFriend($friendship: Int!) {
    removeFriendship(friendship: $friendship) {
      id
    }
  }
`)

export const CREATE_GAME = gql(`
  mutation create($type: String!, $userId: Int!) {
    createGame(type: $type, userId: $userId) {
      id
      type
      status
    }
  }
`)

export const UPDATE_GAME = gql(`
  mutation update($id: Int!, $status: String!, $userId: Int!) {
    updateGame(id: $id, status: $status, userId: $userId) {
      id
      type
      status
      winnerId
    }
  }
`)

export const ALL_PLAYED_GAMES_BY_ID = gql(`
  query getAllPlayedGames($userId: Int!) {
    getAllGamesFromId(userId: $userId) {
      id
      player1Id
      player2Id
      winnerId
      status
      type
    }
  }
`)

export const PLAYED_GAMES_BY_ID = gql(`
  query getPlayedGames($take: Int!, $userId: Int!) {
    getGamesFromId(take: $take, userId: $userId) {
      id
      player1Id
      player2Id
      winnerId
      status
      type
    }
  }
`)

export const GAMES_BY_ID = gql(`
  mutation Games($take: Int!, $userId: Int!) {
    Games(take: $take, userId: $userId) {
      id
      player2 {
        id
        login
        login42
        image
      }
      player1 {
        id
        image
        login
        login42
      }
      status
      type
      winnerId
    }
  }
`)

export const QUIT_CONV = gql(`
mutation ($conversationId: Int!) {
	  quitConversation(conversationId: $conversationId) {
		id
	}
}
`)


export const KICK_USER = gql(`
mutation KickUser($conversationId: Int!, $userId: Int!) {
  KickUser(conversationId: $conversationId, userId: $userId) {
    id
  }
}
`)

export const MUTE_USER = gql(`
mutation MuteUser($conversationId: Int!, $userId: Int!) {
  MuteUser(conversationId: $conversationId, userId: $userId) {
    id
  }
}
`)

export const BAN_USER = gql(`
mutation BanUser($conversationId: Int!, $userId: Int!) {
  BanUser(conversationId: $conversationId, userId: $userId) {
    id
  }
}
`)

export const UNBAN_USER = gql(`
mutation UnBanUser($conversationId: Int!, $userId: Int!) {
  UnBanUser(conversationId: $conversationId, userId: $userId) {
    id
  }
}
`)

export const UPGRADE_ADMIN = gql(`
mutation setAdmin ($conversationId: Int!, $userId: Int!) {
  setAdmin(conversationId: $conversationId, userId: $userId) {
    id
  }
}
`)

export const DOWNGRADE_ADMIN = gql(`
mutation unsetAdmin ($conversationId: Int!, $userId: Int!) {
	unsetAdmin(conversationId: $conversationId, userId: $userId) {
    id
  }
}
`)


export const UPDATE_CONV = gql(`
mutation UpdateConversation($idConversation: Float!, $password: String!, $type: String!) {
  updateConversation(idConversation: $idConversation, password: $password, type: $type) {
    id
    type
  }
}
`)

export const JOIN_CONV = gql(`
mutation JoinConversation($conversationId: Int!, $password: String) {
  JoinConversation(conversationId: $conversationId, password: $password) {
    id
    members {
      user {
        id
        image
        login
        login42
      }
    }
    admins {
      user {
        id
        login
        login42
        image
      }
    }
    messages {
      content
      date
      id
      sender {
        id
        id42
        login
        login42
      }
    }
    mutes {
      user {
        id
      }
      mutedUntil
    }
    bannedUsers {
      userBanned {
        id
        image
        login
        login42
      }
    }
    name
    owner {
      id
      image
      login
      login42
    }
  }
}
`)