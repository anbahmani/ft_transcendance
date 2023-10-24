import { Injectable } from '@nestjs/common';
import { membership } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MembershipService {

	constructor(private prisma: PrismaService) {}

	async getAllMemberships(): Promise<membership[]> {
		return await this.prisma.membership.findMany();
	}

	async getAllMembershipsByConversationId(conversationId: number): Promise<membership[]> {
		return await this.prisma.membership.findMany({
			where:{
				conversationId: conversationId
			}
		});
	}

	async addUserToConversation(userId: number, conversationId: number): Promise<membership> {
		return await this.prisma.membership.create({
			data: {
				userId: userId,
				conversationId: conversationId
			}
		})
	}

	async removeUserFromConversation(userId: number, conversationId: number): Promise<void>{
		await this.prisma.membership.delete({
			where: {
			  conversationId_userId: {
				conversationId: conversationId,
				userId: userId,
			  },
			},
		  });
	}
}
