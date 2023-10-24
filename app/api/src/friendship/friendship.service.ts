import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { friendship, Prisma } from '@prisma/client';

@Injectable()
export class FriendshipService {
  constructor(private prisma: PrismaService) {}
  
  async friendship(
    where : Prisma.friendshipWhereUniqueInput
    ): Promise<friendship | null> {
      return this.prisma.friendship.findUnique({
        where: where,
      });
    }
    
  async updateFriendship(params: {
    where: Prisma.friendshipWhereUniqueInput;
    data: Prisma.friendshipUpdateInput;
  }): Promise<friendship> {
    const { where, data } = params;
    return this.prisma.friendship.update({
      data,
      where,
    });
  }

  async friendships(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.friendshipWhereUniqueInput;
    where?: Prisma.friendshipWhereInput;
    orderBy?: Prisma.friendshipOrderByWithRelationInput;
  }): Promise<friendship[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.friendship.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createFriendship(data: Prisma.friendshipCreateInput): Promise<friendship> {
    return this.prisma.friendship.create({
      data,
    });
  }


  async deleteFriendship(where: Prisma.friendshipWhereUniqueInput): Promise<friendship> {
    return this.prisma.friendship.delete({
      where,
    });
  }
}