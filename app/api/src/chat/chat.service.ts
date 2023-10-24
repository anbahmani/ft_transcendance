import { Injectable } from '@nestjs/common';
import { conversation, discussion } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
	 
	constructor(private prisma: PrismaService) {}

	async getConversationsAndDiscussionsByUserId(userId: number) : Promise<(conversation | discussion)[]> {
		const userConversations = await this.prisma.conversation.findMany({
			where: {
			  members: {
				some: {
				  userId: userId,
				},
			  },
			},
			include: {
				messages: {
					orderBy: {
						date: 'desc',
			  },
			},
		  }
		});
		
		  // Récupérer toutes les discussions de l'utilisateur
		  const userDiscussions = await this.prisma.discussion.findMany({
			where: {
			  OR: [
				{ participant1Id: userId },
				{ participant2Id: userId },
			  ],
			},
			include: {
				messages: {
					orderBy: {
						date: 'desc',
			  },
			},
		  }
		});
		
		  // Fusionner les deux listes en une seule
		  const allUserConversationsAndDiscussions = [...userConversations, ...userDiscussions];
		
		  // Trier la liste fusionnée par date du dernier message
		  allUserConversationsAndDiscussions.sort((a, b) => {
			const aLastMessageDate = a.messages.length > 0 ? a.messages[0].date : new Date(0);
			const bLastMessageDate = b.messages.length > 0 ? b.messages[0].date : new Date(0);
		
			return bLastMessageDate.getTime() - aLastMessageDate.getTime();
		  });
		
		  return allUserConversationsAndDiscussions;
	}
}
