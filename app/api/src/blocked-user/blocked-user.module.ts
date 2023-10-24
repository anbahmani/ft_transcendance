import { Module } from '@nestjs/common';
import { BlockedUserService } from './blocked-user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockedUserResolver } from './blocked-user.resolver';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [BlockedUserService, PrismaService, BlockedUserResolver, UserService, JwtService]
})
export class BlockedUserModule {}
