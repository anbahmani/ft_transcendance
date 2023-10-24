import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BannedUserService {

	constructor(private prisma: PrismaService){}

	async banUserFromConversation(userBannedId: number, conversationId: number, userBannerId: number): Promise<void> {
		await this.prisma.bannedUser.create({
		  data: {
			userBannedId: userBannedId,
			conversationId: conversationId,
			userBannerId: userBannerId
		  }
		});

		// Supprimer l'utilisateur des membres de la conversation.
		await this.prisma.membership.delete({
			where: {
			  conversationId_userId: {
				conversationId: conversationId,
				userId: userBannedId,
			  },
			},
		  });
	  }
	
	  async unbanUserFromConversation(userId: number, conversationId: number): Promise<void> {
		await this.prisma.bannedUser.delete({
		  where: {
			userBannedId_conversationId: {
			  userBannedId: userId,
			  conversationId: conversationId
			}
		  }
		});
		 await this.prisma.membership.create({
			data: {
			  conversationId: conversationId,
			  userId: userId
			}});
		}
	  
	async isUserBannedFromConversation(userId: number, conversationId: number): Promise<boolean> {
		const bannedUser = await this.prisma.bannedUser.findUnique({
		  where: {
			userBannedId_conversationId: {
			  userBannedId: userId,
			  conversationId: conversationId
			}
		  }
		});
	  
		return bannedUser !== null;
	  }
}
