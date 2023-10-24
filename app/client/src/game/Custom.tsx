import socket from './socket.ts';
import React, { useState, useEffect } from 'react';
import "./Game.css";

interface ConnectionStateProps {
    isConnected: boolean;
}

interface EventsProps {
    events: string[];
}


function ConnectionState({ isConnected }: ConnectionStateProps) {
    return <p>State: {String(isConnected)}</p>;
}

function Events({ events }: EventsProps) {
    return (
        <ul>
        {
          events.map((event, index) =>
            <li key={ index }>{ event }</li>
          )
        }
        </ul>
      );
}

function ConnectionManager() {
    function connect() {
      socket.connect();
    }
  
    function disconnect() {
      socket.disconnect();
    }
  
    return (
      <>
        <button onClick={ connect }>Connect</button>
        <button onClick={ disconnect }>Disconnect</button>
      </>
    );
}

function MyForm() {
    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  
    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      setIsLoading(true);
  
      socket.timeout(5000).emit('create-something', value, () => {
        setIsLoading(false);
      });
    }
  
    return (
      <form onSubmit={ onSubmit }>
        <input onChange={ e => setValue(e.target.value) } />
  
        <button type="submit" disabled={ isLoading }>Submit</button>
      </form>
    );
}


export default function Custom() {

    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [fooEvents, setFooEvents] = useState<string[]>([]);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function onFooEvent(value: string) {
            setFooEvents(previous => [...previous, value]);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('foo', onFooEvent);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('foo', onFooEvent);
        };
    }, []);

    return (
        <>
            <ConnectionState isConnected={ isConnected } />
            <Events events={ fooEvents } />
            <ConnectionManager />
            <MyForm />
        </>
    )
}