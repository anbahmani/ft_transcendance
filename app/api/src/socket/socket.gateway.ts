import { WebSocketGateway, OnGatewayConnection, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io'
//import { SocketService } from './socket.service';
//import { DataFriendship } from 'src/friendship/data_friendship.type';
//import { getSocketIOInstance } from './socket.provider';

interface FriendshipData {
  id: number;
  ownerId: number;
  receiverId: number;
  status: string;
  __typename: string;
}

@WebSocketGateway({
    cors: {
        origin: '*'
    },
})

//export class SocketGateway implements OnGatewayConnection {
export class SocketGateway {

  //constructor(private readonly socketService: SocketService) {
  // this.ioInstance = getSocketIOInstance();
  //}
  @WebSocketServer()
  //private readonly ioInstance: Server;
  ioInstance: Server;

  /*handleConnection(client: Socket) {
    console.log("Gateway connect socket: ", client.id);
  }*/

  @SubscribeMessage('hello')
  handleHello(@MessageBody() data: string, @ConnectedSocket() client: Socket) {

    console.log("Client sent hello and : ", data);
    this.ioInstance.emit('hello', "emit global", data);
    this.ioInstance.to(client.id).emit('hello', `emit target ${client.id}`, data);
  }

  @SubscribeMessage('world')
  handleWorld(@MessageBody() data: string, @ConnectedSocket() client: Socket) {

    console.log("Client sent world and : ", data);
    this.ioInstance.emit('world', "emit global", data);
    this.ioInstance.to(client.id).emit('world', `emit target ${client.id}`, data);
  }
  
  handleConnection(socket: Socket): void {
    console.log('gateway socket connection: ', socket.id);
  }

  @SubscribeMessage('newFriendship')
  newFriendship(@MessageBody() data: FriendshipData, @ConnectedSocket() client: Socket) {
    console.log("new id: ", data.id);
    console.log("new ownId: ", data.ownerId);
    console.log("new recId: ", data.receiverId);
    console.log("new status: ", data.status);
    this.ioInstance.emit('friendshipCreated', data);
  }

  @SubscribeMessage('updateFriendship')
  updateFriendship(@MessageBody() data: FriendshipData, @ConnectedSocket() client: Socket) {
    console.log("up id: ", data.id);
    console.log("up ownId: ", data.ownerId);
    console.log("up recId: ", data.receiverId);
    console.log("up status: ", data.status);
    this.ioInstance.emit('friendshipUpdated', data);
  }

  @SubscribeMessage('deleteFriendship')
  deleteFriendship(@MessageBody() data: FriendshipData, @ConnectedSocket() client: Socket) {
    console.log("deleted id: ", data.id);
    this.ioInstance.emit('friendshipRemoved', data);
  }
  /*
  newFriendship(friend: DataFriendship): void {
    this.socketService.sendNewFriendship(friend);
  }

  removedFriendship(friend: DataFriendship): void {
    this.socketService.sendRemovedFriendship(friend);
  }

  updatedFriendship(friend: DataFriendship): void {
    this.socketService.sendUpdatedFriendship(friend);
  }*/

  // Implement other Socket.IO event handlers and message handlers
}