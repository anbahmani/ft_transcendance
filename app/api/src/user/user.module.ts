import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResolver } from './user.resolver';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { BlockedUserService } from 'src/blocked-user/blocked-user.service';
import { MailingService } from 'src/mailing/mailing.service';
import { MailingModule } from 'src/mailing/mailing.module';

@Module({
  providers: [UserService, MailingService, PrismaService, UserResolver, AuthService, JwtService, BlockedUserService],
  exports: [UserService],
  imports: [MailingModule]
})
export class UserModule {}
