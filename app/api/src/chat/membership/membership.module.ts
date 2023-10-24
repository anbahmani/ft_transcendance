import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';

import { PrismaService } from 'src/prisma/prisma.service';

@Module({
	providers: [MembershipService, PrismaService]
})
export class MembershipModule {}
