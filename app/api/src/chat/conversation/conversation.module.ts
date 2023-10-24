import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationResolver } from './conversation.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MembershipService } from '../membership/membership.service';
import { ConversationManagementService } from '../conversation-management/conversation-management.service';
import { MessageService } from '../message/message.service';
import { BannedUserService } from '../banned-user/banned-user.service';

@Module({
  providers: [ConversationResolver, ConversationService, PrismaService, UserService, JwtService, MembershipService, ConversationManagementService, MessageService, MembershipService, BannedUserService]
})
export class ConversationModule {}
