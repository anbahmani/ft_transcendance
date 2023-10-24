import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationManagementService {
  constructor(private prisma: PrismaService) {}

  async addAdminToConversation(conversationId: number, userId: number): Promise<any> {
    return this.prisma.conversationManagement.create({
      data: {
        conversationId: conversationId,
        userId: userId
      },
    });
  }

  async removeAdminFromConversation(conversationId: number, userId: number): Promise<any> {
	return this.prisma.conversationManagement.delete({
	  where: {
		conversationId_userId: {
		  conversationId: conversationId,
		  userId: userId
		}
	  }
	});
  }
}
