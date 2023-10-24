import React, { useState, useEffect } from 'react';
import Navbar from './navbar.tsx';
import socket from './socket.ts';

function ConnectionManager() {
    function connect() {
      socket.connect();
    }
  
    function disconnect() {
      socket.disconnect();
    }
  
    const connectionLog : string = socket.connected ? 'Socket connected' : 'Socket disconnected';
    return (
      <>
        <button onClick={ connect }>Connect</button>
        <button onClick={ disconnect }>Disconnect</button>
        <p>{connectionLog}</p>
      </>
    );
}

export default function Socket_test() {
  const [userInput, setUserInput] = useState<string>('');
  const [received, setReceived] = useState<string>('');

  const user = sessionStorage.getItem("user");
  const other = JSON.parse(user as string);
  
  const [room, setRoom] = useState<string>(other.login42);

  useEffect(() => {
    socket.on('getroom', (data) => {
      setRoom(data);
  });

  return () => {
    socket.off('getroom');
    }
  }, []);

  useEffect(() => {
    // Listen for the 'message' event
    socket.on('message', (clientId, data) => {
      // Handle the received message
    
        if (clientId != socket.id) {
            console.log(`Received message from client ${clientId}: ${data}`);
            setReceived(data);
        }
    });

    // Clean up the event listener on component unmount
    return () => {
      socket.off('message');
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const handleSendClick = () => {
    socket.emit('message', userInput);
  };

  const handleGetRoom = () => {
    console.log("sending getRoom");
    socket.emit('getroom', room);
  }

  if (socket.connected) {
    console.log('Socket is connected');
  }
  else {
    console.log('Socket is not connected');
  }
  return (
    <>
      <Navbar />
      <div className='glass-panel'>
          <ConnectionManager />
          <input type="text" value={userInput} onChange={handleInputChange} />
          <p>User Input: {userInput}</p>
          <button onClick={handleSendClick}>Send</button>
          <button onClick={handleGetRoom}>Get Room</button>
            <p>{received}</p>
      </div>
    </>
  );
}