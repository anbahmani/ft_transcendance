import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket} from 'socket.io';
import { Message } from './message/message.type';
import { ConversationService } from './conversation/conversation.service';
import { ConversationTypeEnum } from './conversation/conversationtype.enum';
import { BannedUserService } from './banned-user/banned-user.service';
import { MembershipService } from './membership/membership.service';
import { MessageService } from './message/message.service';
import { DiscussionService } from './discussion/discussion.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.type';
import { socketIoProvider } from 'src/socket-io.provider';
import { clearLine } from 'readline';

@WebSocketGateway({
    cors: {
        origin: '*'
    },
})
export class ChatGateway {

	constructor(private conversationService: ConversationService,
				private bannedUserService: BannedUserService,
				private messageService: MessageService,
				private userService: UserService,
				){}

	@WebSocketServer() server: Server;

	private logger = new Logger('ChatGateway');
	private userRoom: { [room: string]: any[] } = {};
	private userClient: { [clientId: string]: number } = {};

	/*****************Connection and deconnection to SockerServer**************/

	handleConnection(client: Socket, ...args: any[]) {
		this.userClient[client.id] = null;
		this.logger.log(`Client connected: ${client.id}`);
	  }

	@SubscribeMessage('connectUser')
	async handleUserConnect(@ConnectedSocket() client: Socket, @MessageBody() payload: { userId: number }) {
  		this.userClient[client.id] = payload.userId;
	}

	  handleDisconnect(client: Socket) {
		const idUser = this.userClient[client.id];
		if (this.userRoom && idUser){
			for (const room in this.userRoom){
				this.userRoom[room].splice(this.userRoom[room].findIndex((user) => user.id === idUser), 1);
			}
		}
		if (this.userClient[client.id])
			this.userClient[client.id] = null;
		this.logger.log(`Client Disconnected: ${client.id}`);
	  }

	/******************************Private chat********************************/

	@SubscribeMessage('joinDiscussion')
	async handleJoinDiscussion(@ConnectedSocket() client: Socket, @MessageBody()payload: { userId: number, discussionId: number }) {
		const room = 'DM_' + payload.discussionId;
		const user = await this.userService.user({id: payload.userId});
		client.join(room);
		if (!this.userRoom[room]){
			this.userRoom[room] = [];
		}
		this.userRoom[room].push(
			{
				id: user.id,
				login42: user.login42,
				login: user.login,
				image: user.image
			}
		);
		this.userClient[client.id] = user.id;
		this.logger.log(`Client ${client.id} joined DM ${payload.discussionId}`);
	}

	@SubscribeMessage('chatToDiscussion')
	async handleChatToDiscussion(@ConnectedSocket() client: Socket, @MessageBody()payload: { userId: number, discussionId: number, message: string }) {
		this.logger.log(`Client ${payload.userId} send message to DM ${payload.discussionId}`);
		const message = await this.messageService.createMessage(payload.userId, payload.message, null, payload.discussionId);
        this.server.to('DM_' + payload.discussionId).emit('chatToDiscussion', message);
	}

	@SubscribeMessage('gameInvitation')
	async handleGameInvitation(@MessageBody() payload: {userId: number, discussionId: number, message: string }) {
		this.logger.log(`Client ${payload.userId} send message to DM ${payload.discussionId}`);
		const message = await this.messageService.createInvitationMessage(payload.userId, payload.message, null, payload.discussionId);
        this.server.to('DM_' + payload.discussionId).emit('gameInvitation', message);
	}

	@SubscribeMessage('leaveDiscussion')
	async handleLeaveDiscussion(@ConnectedSocket() client: Socket, @MessageBody()payload: { userId: number, discussionId: number }) {
		const room = 'DM_' + payload.discussionId;
		client.leave(room);
		if (this.userRoom[room])
			this.userRoom[room].splice(this.userRoom[room].findIndex((user) => user.id === payload.userId), 1);
  		this.logger.log(`Client ${payload.userId} left DM ${payload.discussionId}`);
	}

	/******************************Conversation********************************/

	@SubscribeMessage('joinConversation')
	async handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody()payload: { userId: number, conversationId: number, isNewUser: boolean}) {
		if (payload.isNewUser){
			this.logger.log(`New user ${payload.userId} joined conversation ${payload.conversationId}`);
			this.server.to('channel_' + payload.conversationId).emit('newUser', {userId : payload.userId, conversationId: payload.conversationId});
		}
  		client.join('channel_' + payload.conversationId);
		const user = await this.userService.user({id: payload.userId});
		if (!this.userRoom['channel_' + payload.conversationId]){
			this.userRoom['channel_' + payload.conversationId] = [];
		}
		this.userRoom['channel_' + payload.conversationId].push(
			{
				id: user.id,
				login42: user.login42,
				login: user.login,
				image: user.image
			}
		);
		this.userClient[client.id] = user.id;
  		this.logger.log(`Client ${payload.userId} joined conversation ${payload.conversationId}`);
	}


	@SubscribeMessage('leaveConversation')
	async handleLeaveConversation(@ConnectedSocket() client: Socket, @MessageBody()payload: {userId: number, conversationId: number}) {
  		client.leave('channel_' + payload.conversationId);
		if (this.userRoom['channel_' + payload.conversationId])
			this.userRoom['channel_' + payload.conversationId].splice(this.userRoom['channel_' + payload.conversationId].findIndex((user) => user.id === payload.userId), 1);
  		this.logger.log(`Client ${payload.userId} left conversation ${payload.conversationId}`);
	}

	@SubscribeMessage('chatToConversation')
	async handleChatToConversation(@ConnectedSocket() client: Socket, @MessageBody()payload: { userId: number, conversationId: number, message: string }) {
		const conversation = await this.conversationService.conversation({id: payload.conversationId});
		const mutedUser = conversation?.mutes?.find((mute) => mute.user.id === payload.userId);
		this.logger.log(`muted User ${mutedUser}`);
		if (mutedUser && mutedUser.mutedUntil > new Date()){
			return;
		}
		const message = await this.messageService.createMessage(payload.userId, payload.message, payload.conversationId, null);
		this.server.to('channel_' + payload.conversationId).emit('chatToConversation', message);
	}

	@SubscribeMessage('addUser')
	handleAddUserToConversation(@ConnectedSocket() client: Socket, @MessageBody()payload: { userId: number, conversationId: number}) {
		const socketId = Object.keys(this.userClient).find(key => this.userClient[key] === payload.userId);
		if (socketId){
			this.server.to(socketId).emit('joinConv', {conversationId : payload.conversationId});
		}
		this.server.to('channel_' + payload.conversationId).emit('addUser', {userId: payload.userId, conversationId: payload.conversationId});
	}

	@SubscribeMessage('kick')
	handleKick(@ConnectedSocket() client: Socket, @MessageBody()payload: { userId: number, conversationId: number}) {
		this.server.emit('kick', {userId : payload.userId, conversationId: payload.conversationId});
		this.server.to('channel_' + payload.conversationId).emit('kickUser', {userId : payload.userId, conversationId: payload.conversationId});
	}

	@SubscribeMessage('setAdmin')
	handleSetAdmin(@ConnectedSocket() client: Socket, @MessageBody()payload: { userId: number, conversationId: number}) {
		this.server.emit('setAdmin', {userId : payload.userId, conversationId: payload.conversationId});
		this.server.to('channel_' + payload.conversationId).emit('setAdminUser', {userId : payload.userId, conversationId: payload.conversationId});
	}

	@SubscribeMessage('unsetAdmin')
	handleUnsetAdmin(@ConnectedSocket() client: Socket, @MessageBody()payload: { userId: number, conversationId: number}) {
		this.server.emit('unsetAdmin', {userId : payload.userId, conversationId: payload.conversationId});
		this.server.to('channel_' + payload.conversationId).emit('unsetAdminUser', {userId : payload.userId, conversationId: payload.conversationId});
	}

	/*********************************Bann*************************************/

	@SubscribeMessage('banUserFromConversation')
	async handleBanUserFromConversation(@MessageBody() payload: { adminId: number, userId: number, conversationId: number }) {
  	// Vérifiez ici que adminId a l'autorité pour bannir l'utilisateur, si nécessaire

  		await this.bannedUserService.banUserFromConversation(payload.userId, payload.conversationId, payload.adminId);
	}

	@SubscribeMessage('unbanUserFromConversation')
	async handleUnbanUserFromConversation(@MessageBody() payload: { adminId: number, userId: number, conversationId: number }) {
  	// Vérifiez ici que adminId a l'autorité pour débannir l'utilisateur, si nécessaire

  		await this.bannedUserService.unbanUserFromConversation(payload.userId, payload.conversationId);
	}
}



