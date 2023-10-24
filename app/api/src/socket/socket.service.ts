import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { DataFriendship } from 'src/friendship/data_friendship.type';
import { getSocketIOInstance } from './socket.provider';


@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, Socket> = new Map();
  private readonly ioInstance: Server;

  constructor() {
    this.ioInstance = getSocketIOInstance();
  }

  handleConnection(socket: Socket): void {
    console.log("WTF HANDLE CONNECT");
    const clientId = socket.id;
    this.connectedClients.set(clientId, socket);

   // console.log("CLIENT CONNECTED SERVICE");

    socket.on('disconnect', () => {
      this.connectedClients.delete(clientId);
     // console.log("CLIENT DISCONNECT SERVICE");
    });
    // Handle other events and messages from the client
  }

  /*handleDisconnect(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.set(clientId, socket);

    console.log("CLIENT CONNECTED");

    socket.on('disconnect', () => {
      this.connectedClients.delete(clientId);
    });
    // Handle other events and messages from the client
  }*/

  sendNewFriendship(friend: DataFriendship): void {
    this.ioInstance.emit('friendshipCreated', friend);
    console.log(`server new friendship: ${friend}`);
  }

  sendRemovedFriendship(friend: DataFriendship): void {
    this.ioInstance.emit('friendshipRemoved', friend);
    console.log(`server removed friendship: ${friend}`);
  }

  sendUpdatedFriendship(friend: DataFriendship): void {
    this.ioInstance.emit('friendshipUpdated', friend);
    console.log(`server updated friendship: ${friend}`);
  }
  // Add more methods for handling events, messages, etc.
}