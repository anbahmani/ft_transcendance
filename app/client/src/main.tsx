import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Auth from './Auth.tsx'
//import './index.css'
import './game/Home.scss'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { createUploadLink } from "apollo-upload-client";
import App from './App.tsx';
import Profile from './Profile.tsx';
import Game from './game/Game.tsx';
import GameStart, { Gameplay } from './game/gamestart.tsx';
import Socket_test from './game/Socket_test.tsx';
import Friends from './Friends/Friends.tsx';
import Chat from './Chat/Chat.tsx';
import Spectate from './Spectate/Spectate.tsx';
import GameCustom from './game/GameCustom.tsx';
import JoinCustom from './game/JoinCustom.tsx';
import DeniedAccess from './game/DeniedAccess.tsx';
import RankedSpectate from './game/RankedSpectate.tsx';
import CustomSpectate from './game/CustomSpectate.tsx';
import Sparkles from './Sparkles/Sparkles.tsx';
import NavBar from './Nav.tsx';
import socket from './game/socket.ts';
import {OnlineStatus} from './status.ts';


socket.on('isConnected', () => {

  if (sessionStorage.getItem("user") != null) {
    const my_user = JSON.parse(sessionStorage.getItem("user") as string);
    socket.emit("firstConnection", my_user.login42);
    socket.emit('isConnected', {login: my_user.login42, status: OnlineStatus});
  }
})

const cache = new InMemoryCache({
  typePolicies: {
    conversation: {
      fields: {
        messages: {
          keyArgs: false, // Prevent automatic keyArgs behavior
          merge(existing = [], incoming) {
            // Combine existing and incoming messages, avoiding duplicates
            const merged = existing ? existing.slice(0) : [];
            const existingIds = new Set(merged.map(message => message.__ref));

            for (const message of incoming) {
              if (!existingIds.has(message.__ref)) {
                merged.push(message);
                existingIds.add(message.__ref);
              }
            }

            return merged;
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  cache: cache,
  link: createUploadLink({
    uri: "http://localhost:3000/graphql",
    fetch,
    fetchOptions: { credentials: 'include' },
    credentials: 'include',
  }),
  credentials: 'include',
});

interface ChatAppProps {
	user: string;
  }

const router = createBrowserRouter([
  {
    path: "/",
    // element:  <Auth />
    element: sessionStorage.getItem("user") == null ? <Auth /> : <App />
  },
  {
    path: "/App",
    element: <App />
  },
  {
    path: "/Chat",
    element: <Chat />
  },
  {
    path: "/Game",
    element: <Game />
  },
  {
    path: "/GameStart",
    element: <GameStart />
  },
  {
    path: "/Gamelobby",
    element: <Gameplay />
  },
  {
    path: "/RankedSpectate",
    element: <RankedSpectate />
  },
  {
    path: "/gamecustom",
    element: <GameCustom />
  },
  {
    path: "/CustomSpectate",
    element: <CustomSpectate />
  },
  {
    path: "/deniedaccess",
    element: <DeniedAccess />
  },
  {
    path: "/joincustom",
    element: <JoinCustom />
  },
  {
    path: "/Spectate",
    element: <Spectate /> 
  },
  {
    path: "/Friends",
    element: <Friends />
  },
  {
    path: "/Socket",
    element: <Socket_test />
  },
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/Nav",
    element: <NavBar />
  },
  {
	  path: "/Chat",
	  element: <Chat/>
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  //<React.StrictMode>
    <ApolloProvider client={client}>
		<Sparkles/>
    	<NavBar />
    	<RouterProvider router={router} />
    </ApolloProvider>
 // </React.StrictMode>,
)
