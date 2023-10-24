import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ConversationService } from './conversation/conversation.service';
import { BannedUserService } from './banned-user/banned-user.service';
import { MembershipService } from './membership/membership.service';
import { MembershipModule } from './membership/membership.module';
import { MessageModule } from './message/message.module';
import { MessageService } from './message/message.service';
import { DiscussionService } from './discussion/discussion.service';
import { DiscussionModule } from './discussion/discussion.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockedUserModule } from '../blocked-user/blocked-user.module';
import { ChatResolver } from './chat.resolver';
import { ConversationManagementModule } from './conversation-management/conversation-management.module';
import { ConversationManagementService } from './conversation-management/conversation-management.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [ChatService, ChatGateway, MembershipService, DiscussionService, PrismaService, ChatResolver, ConversationService, BannedUserService, MessageService, ConversationManagementService, UserService],
  imports: [MembershipModule, MessageModule, DiscussionModule, BlockedUserModule, ConversationManagementModule, UserModule]
})
export class ChatModule {}
