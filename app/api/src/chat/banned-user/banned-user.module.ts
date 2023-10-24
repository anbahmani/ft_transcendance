import { Module } from '@nestjs/common';
import { BannedUserService } from './banned-user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
	providers: [BannedUserService, PrismaService]
})
export class BannedUserModule {}
