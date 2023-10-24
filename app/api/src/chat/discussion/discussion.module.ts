import { Module } from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DiscussionResolver } from './discussion.resolver';
import { JwtService } from '@nestjs/jwt';

@Module({
	providers: [DiscussionService, PrismaService, DiscussionResolver, JwtService]
})
export class DiscussionModule {}
