import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { user, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  
  async user(
    where : Prisma.userWhereUniqueInput
    ): Promise<user | null> {
      return this.prisma.user.findUnique({
        where: where,
      });
    }

    async search(where: string): Promise<user[]> {
      const users = await this.prisma.user.findMany({
        where: {
        login42: {
          contains: where 
        }
        },
        select: {
          id: true,
          login: true,
          image: true,
          login42: true,
          email: true,
          isVerified: true,
          id42: true,
          first_name: true,
          last_name: true,
          url: true,
          token: true,
        },
        take: 5
      });
      
      return users;
    }

  async updateUser(params: {
    where: Prisma.userWhereUniqueInput;
    data: Prisma.userUpdateInput;
  }): Promise<user> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.userWhereUniqueInput;
    where?: Prisma.userWhereInput;
    orderBy?: Prisma.userOrderByWithRelationInput;
  }): Promise<user[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.userCreateInput): Promise<user> {
    return this.prisma.user.create({
      data,
    });
  }


  async deleteUser(where: Prisma.userWhereUniqueInput): Promise<user> {
    return this.prisma.user.delete({
      where,
    });
  }

  async getUsersByConversationId(conversationId: number): Promise<user[]> {
    return this.prisma.user.findMany({
      where: {
        conversations: {
          some: {
            conversationId: conversationId,
          },
        },
      },
      include: {
        conversations: true,  // optionally include the conversations in the returned User objects
      },
    });
  }

  async getUsers(params: {
    take?: number;
    orderBy?: {
      login?: Prisma.SortOrder;
    };
  }): Promise<user[]> {
    return this.prisma.user.findMany({
      take: params.take || undefined,
      orderBy: params.orderBy ? { login: params.orderBy.login } : undefined,
    });
  }

  
}
