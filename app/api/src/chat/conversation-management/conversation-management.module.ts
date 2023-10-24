import { Module } from '@nestjs/common';
import { ConversationManagementService } from './conversation-management.service';
import { ConversationManagementResolver } from './conversation-management.resolver';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
	providers: [ConversationManagementService, ConversationManagementResolver, PrismaService]
  })
export class ConversationManagementModule {}
