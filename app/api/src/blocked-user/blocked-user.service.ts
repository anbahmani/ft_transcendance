import { Injectable } from '@nestjs/common';
import { blockedUser, user } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlockedUserService {
	constructor(private prisma: PrismaService) {}

	async getBlockedUsers(blockerId: number): Promise<user[]> {
		let test= await this.prisma.blockedUser.findMany({
		  where: {
			blockedById: blockerId
		  },
		  include: {
			blockedUser: true
		  },
		})
		.then(blocks => blocks.map(block => block.blockedUser));
		return test;
	  }

	  async unblockUser(blockerId: number, blockedId: number): Promise<blockedUser | null> {
		return this.prisma.blockedUser.delete({
		  where: {
			blockedById_blockedUserId: {
			  blockedById: blockerId,
			  blockedUserId: blockedId
			}
		  }
		});
	  }

	  async blockUser(blockerId: number, blockedId: number): Promise<blockedUser> {
		return this.prisma.blockedUser.create({
		  data: {
			blockedById: blockerId,
			blockedUserId: blockedId
		  }
		});
	  }

	  async listBlocked(id: number): Promise<blockedUser[]> {
		return this.prisma.blockedUser.findMany({
		  where: {
			OR: [
				{blockedById : id},
				{blockedUserId : id}
			]
		  }
	  });
	}
}
