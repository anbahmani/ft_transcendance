import { io } from 'socket.io-client';

const URL : string = 'http://localhost:3000';

const socket = io(URL, {autoConnect: true});

socket.connect();

export default socket;