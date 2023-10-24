import { Injectable } from '@nestjs/common';
import { message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from './message.type';

@Injectable()
export class MessageService {

	constructor(private prisma: PrismaService){}

	async createMessages(messages: any[]) : Promise<void> {
		await this.prisma.message.createMany({
			data: messages
		});
	}

	async messagesInConversation(idConversation: number): Promise<message[]> {
		return this.prisma.message.findMany({
			where: {
			  conversationId: idConversation
			},
			orderBy: {
					date: 'desc'
				}
		});
	}

	async messagesInDiscussion(idDiscussion: number): Promise<message[]> {
		return this.prisma.message.findMany({
			where: {
			  discussionId: idDiscussion
			},
			orderBy: {
					date: 'desc'
				}
		});
	}

	async createMessage(idSender: number, content: string, idConversation?: number, idDiscussion?: number, date?: Date): Promise<message> {

		return this.prisma.message.create({
			data: {
				senderId: idSender,
				content: content,
				conversationId: idConversation,
				discussionId: idDiscussion,
				date: date
			  },
			});
		}

		async createInvitationMessage(idSender: number, content: string, idConversation?: number, idDiscussion?: number, date?: Date): Promise<message> {

			return this.prisma.message.create({
				data: {
					senderId: idSender,
					content: content,
					conversationId: idConversation,
					discussionId: idDiscussion,
					date: date,
					type: "Invitation",
				  },
				});
			}
}
