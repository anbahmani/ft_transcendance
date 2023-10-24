import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Message } from "src/chat/message/message.type";
import * as os from 'os';
import { socketIoProvider } from "src/socket-io.provider";
import { integrations_v1alpha } from "googleapis";


interface moveProps {
    room: string;
    key: string;
    value: string;
}

interface FriendshipData {
    id: number;
    ownerId: number;
    receiverId: number;
    status: string;
    __typename: string;
}

interface RgbaProps {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface ColorProps {
    color: string,
    glow: boolean,
    rgba: RgbaProps
}

const defaultColor: ColorProps = {
    color: "#ffffff",
    glow: false,
    rgba: { r: 255, g: 255, b: 255, a: 0.6 }
};

const gameDefaultColor: ColorProps = {
    color: "#000000",
    glow: false,
    rgba: { r: 255, g: 255, b: 255, a: 0.6 }
};

interface RoomColors {
    paddleColor: ColorProps;
    epaddleColor: ColorProps;
    ballColor: ColorProps;
    lineColor: ColorProps;
    backColor: ColorProps;
}

interface Connected {

    login: string;
    status: string;
}

@WebSocketGateway({
    //permet de linker le serveur a des origines (socket essayant de se connecter au serv) specifiques
    //ici on link le serveur a toutes les origines pour faire plus simple
    cors: {
        origin: '*'
    },
})

export class SocketEvents {

    //Creation du serveur
    @WebSocketServer()
    io: Server;

    private createdRanked: { [room: string]: string[] } = {};
    private createdCustom: { [room: string]: string[] } = {};
    private customInvites: { [room: string]: string [] } = {};
    private customColors: { [room: string]: RoomColors } = {};
    private onlineStatus: { [login: string]: string} = {};
    private users: string[] = [];

    //connexion

    handleConnection(client: Socket){
        console.log(`Client Connected: ${client.id}`);
    }
    
    //deconnexion
    handleDisconnect(client: Socket) {
        console.log(`Client Disconnected: ${client.id}`);
    }

    afterInit() {

        setInterval(() => {
            this.io.emit('isConnected');

            this.users.forEach(user => {
                
                this.onlineStatus[user] = "Disconnected";
            });

            setTimeout(() => {

                this.io.emit('statusList', this.onlineStatus);

            }, 2000);

        }, 3000);
    }

    @SubscribeMessage('firstConnection')
    handleFirstConnection(@MessageBody() login: string) {

        if (!this.users.includes(login)) {
            this.users.push(login);
            console.log(`${login} added to users list`);
        }
    }

    @SubscribeMessage('isConnected')
    handleIsConnected(@MessageBody() connected: Connected) {
        this.onlineStatus[connected.login] = connected.status;
    }

    @SubscribeMessage('newFriendship')
    newFriendship(@MessageBody() data: FriendshipData, @ConnectedSocket() client: Socket) {
        this.io.emit('friendshipCreated', data);
    }

    @SubscribeMessage('updateFriendship')
    updateFriendship(@MessageBody() data: FriendshipData, @ConnectedSocket() client: Socket) {
        console.log("up id: ", data.id);
        console.log("up ownId: ", data.ownerId);
        console.log("up recId: ", data.receiverId);
        console.log("up status: ", data.status);
        this.io.emit('friendshipUpdated', data);
    }

    @SubscribeMessage('deleteFriendship')
    deleteFriendship(@MessageBody() data: FriendshipData, @ConnectedSocket() client: Socket) {
        console.log("deleted id: ", data.id);
        this.io.emit('friendshipRemoved', data);
    }

    @SubscribeMessage('customCreateRoom')
    handleCustomCreateRoom(@MessageBody() login: string, @ConnectedSocket() client: Socket) {

        var newroom = "customroom-" + login;

        client.join(newroom);

        const roomInfo = this.io.sockets.adapter.rooms[newroom];
        const numPeopleInRoom = roomInfo ? roomInfo.length : 0;
    
        console.log(`${login} created a new custom room. Number of people in the room: ${numPeopleInRoom}`);
        this.customInvites[newroom] = [];
        this.createdCustom[login] = [];

        this.createdCustom[login].push(login);
        this.io.to(newroom).emit("specroom");
    }

    @SubscribeMessage('customJoinRoom')
    handleCustomJoinRoom(@MessageBody() data: {roomlogin: string, login: string, id: number}, @ConnectedSocket() client: Socket) {

        //data[0] = room
        //data[1] = login
        //data[2] = id

        const { roomlogin, login, id } = data;

        console.log(`${roomlogin}, ${login}, ${id}`);
        var newroom = "customroom-" + roomlogin;

        console.log("this custom invite [roomlogin]", this.customInvites[roomlogin]);
        if (this.customInvites[roomlogin]?.includes(login)) {
            console.log("Clearing CustomInvites[room]");
            this.customInvites[roomlogin] = [];
            client.join(newroom);
            this.io.to(newroom).emit("customStart", login, id);
            this.io.to(newroom).emit("specroom");

            const colors = this.customColors[roomlogin];
            this.io.to(client.id).emit("getColors", colors);
            this.createdCustom[roomlogin].push(login);
        } else {
            console.log("Denied Access");
            this.io.to(client.id).emit("deniedAccess");
        }
    }

    @SubscribeMessage('playing')
    handlePlaying(@MessageBody() login: string) {

        var newroom = "customroom-" + login;
        this.io.to(newroom).emit('playing');
    }

    @SubscribeMessage('customSpecRoom')
    handleCustomSpecRoom(@MessageBody() login: string, @ConnectedSocket() client: Socket) {

        var newroom = "customroom-" + login;
        client.join(newroom);
        console.log(`Spec joined ${newroom}`);

        const colors = this.customColors[login];
        this.io.to(client.id).emit("getColors", colors);
    }

    @SubscribeMessage('specJoinRoom')
    handleSpecJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {

        client.join(room);
        console.log(`Spec joined ${room}`);
    }

    @SubscribeMessage('sendCustomInvite')
    handleSendCustomInvite(@MessageBody() data: {roomlogin: string, login: string}) {

        //data[0] = room
        //data[1] = invited user login
        
        const {roomlogin, login} = data;
        var room = roomlogin;

        console.log(`roomlogin = ${roomlogin}, login = ${login}`);

        if (!this.customInvites[room])
            this.customInvites[room] = [];
        this.customInvites[room].push(login);
    }

    @SubscribeMessage('customEnd')
    handlCustomeEnd(@MessageBody() data: string[], @ConnectedSocket() client: Socket) {
        
        //data[0] = login
        //data[1] = winner = host | enemy

        console.log("log: ", data[0]);
        console.log("winner: ", data[1]);

        var room = data[0];
        
        this.io.to(room).emit('customEnd', data[1]);
        this.io.in(room).socketsLeave(room);
    }

    @SubscribeMessage('getRanked')
    handleGetRanked(@ConnectedSocket() client: Socket) {

        const Rankedlist = Object.keys(this.io.sockets.adapter.rooms).filter(roomName => roomName.startsWith('room-'));
        
        //console.log("RankedList: ", Rankedlist);
        this.io.to(client.id).emit('getRanked', Rankedlist);
    }

    @SubscribeMessage('getCustom')
    handleGetCustom(@ConnectedSocket() client: Socket) {

        const Customlist = this.createdCustom;
        
        console.log("CustomList: ", Customlist);
        this.io.to(client.id).emit('getCustom', Customlist);
    }

    @SubscribeMessage('updateColors')
    handleUpdateColors(@MessageBody() data: { roomlogin: string, colors: RoomColors}) {

        const { roomlogin, colors } = data;

       // console.log("HOST Room: ", roomlogin);
       // console.log("HOST Colors: ", colors);
        this.customColors[roomlogin] = colors;

        //console.log("rec colors: ", colors);
    }

    @SubscribeMessage('getUpdate')
    handleGetUpdate(@MessageBody() room: string, @ConnectedSocket() client: Socket) {

        const colors = this.customColors[room];

        //console.log("Room: ", room);
        //console.log("Colors: ", colors);
        this.io.to(client.id).emit('getUpdate', colors);
    }

    @SubscribeMessage('colorChange')
    handleColorChange(@MessageBody() data: { room: string, type: string, color: ColorProps }, @ConnectedSocket() client: Socket) {

        const { room, type, color } = data;
        console.log("color Changes on : ", type);

        // Ensure the room exists in the dictionary
        if (!this.customColors[room]) {
            this.customColors[room] = {
                paddleColor: { ...defaultColor },
                epaddleColor: { ...defaultColor },
                ballColor: { ...defaultColor },
                lineColor: { ...defaultColor },
                backColor: { ...gameDefaultColor },
            };
        }

        // Update the corresponding color property based on the type
        const roomColors = this.customColors[room];
        switch (type) {
            case "paddleColor":
                roomColors.paddleColor = color;
                break;
            case "epaddleColor":
                roomColors.epaddleColor = color;
                break;
            case "ballColor":
                roomColors.ballColor = color;
                break;
            case "lineColor":
                roomColors.lineColor = color;
                break;
            case "backColor":
                roomColors.backColor = color;
                break;
            default:
                break;
        }

        var newroom = "customroom-" + room;
        // Emit the color change to other clients in the room
        this.io.to(newroom).emit('colorChanged', type, color);
    }

    @SubscribeMessage('rerender')
    handleReRender() {
        console.log("RERENDER");
        this.io.emit('rerender');
    };

    @SubscribeMessage('getroom')
    handleGetRoom(@MessageBody() data: string[], @ConnectedSocket() client: Socket) {
        const list = this.io.sockets.adapter.rooms;

        var check = "room-" + data[0];
        console.log("EVENT GETROOM from ", data[0]);
        list.forEach((value, key) => {

            //console.log(`key: ${key}`);
            if (key.includes("room-") && check !== "found") {
                
                if (this.io.sockets.adapter.rooms.get(key).size < 2) {

                    console.log("Existing room = ", key);
                    console.log("client id: ", client.id);
                    client.join(key);
                    console.log('Number of clients ', this.io.sockets.adapter.rooms.get(key).size);

                    check = "found";
                    if (this.io.sockets.adapter.rooms.get(key).size == 2) {
                        this.io.to(client.id).emit('getroom', client.id, key, "two");
                        this.io.to(key).emit('start', true, data[0], data[1]);
                        console.log(`${data[0]} emiting START to ${key}`);
                    }
                }
            }
        })
        if (check !== "found") {
            client.join(check);
            console.log('Number of clients ', this.io.sockets.adapter.rooms.get(check).size);
            console.log("Creating room = ", check);
            console.log("client  id: ", client.id);
            this.io.emit('getroom', client.id, check, "one");
        }
    }
    
    @SubscribeMessage('specroom')
    handleSpecRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {

        client.join(room);
        console.log("_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X");
        console.log("Spec joining room : ", room);
        console.log(`number of users in ${room} : ${this.io.sockets.adapter.rooms.get(room)}`);
        this.io.to(client.id).emit('retspecroom', room);
        client.to(room).emit('specroom');
    }

    @SubscribeMessage('specdata')
    handleSpecData(@MessageBody() data: any, @ConnectedSocket() client: Socket) {

        console.log('Received data: ', data);
        this.io.to(data.room).emit('specdata', data);
    }

    @SubscribeMessage('goal')
    handleGoal(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
        this.io.to(room).emit('goal');
    }

    @SubscribeMessage('end')
    handleEnd(@MessageBody() data: string[], @ConnectedSocket() client: Socket) {
        this.io.to(data[0]).emit('end', data[1]);
        this.io.in(data[0]).socketsLeave(data[0]);
    }

    @SubscribeMessage('gameId')
    handleGameId(@MessageBody() data: {id: number, room: string}) {

        console.log(`Emitting gameId: ${data.id} to room ${data.room}`);
        this.io.to(data.room).emit('gameId', data.id);
    }

    @SubscribeMessage('testworking')
    handleTestWorking(@MessageBody() data: {room: string, winId: number, playerId: number, gameId: number}) {

        console.log(`room ${data.room} winner is ${data.winId}, data was sent from ${data.playerId} concerning game : ${data.gameId}`);
    }

    @SubscribeMessage('egoal')
    handleEgoal(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
        this.io.to(room).emit('egoal');
    }

    @SubscribeMessage('ball')
    handleBall(@MessageBody() data: string[], @ConnectedSocket() client: Socket) {
        
        if (data) {

            if (data[0] && data[1] && data[2]) {
                //console.log("X : ", data[1]);
                //console.log("Y : ", data[2]);
                client.to(data[0]).emit('ball', data[1], data[2]);
            }
        }
    }

    @SubscribeMessage('move')
    handleMove(@MessageBody() room: string[], @ConnectedSocket() client: Socket) {

       /* console.log("room 0: ", room[0]);
        console.log("room 1: ", room[1]);
        console.log("room 2: ", room[2]);
        console.log("Room equal ", room);
        console.log("Key equal ", key);
        console.log("Value equal ", value);
        console.log(`${key} = ${value}`);*/
        client.to(room[0]).emit('move', room[1], room[2], room[3]);
    }

    //recevoir un event (s'abonner a un message)
    @SubscribeMessage('message')
    handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
        // envoyer un event
        console.log(`Received message from client ${client.id}: ${data}`);
        this.io.emit('message', client.id, data);

    }
}