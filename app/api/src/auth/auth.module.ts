import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { HttpModule } from '@nestjs/axios';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { MailingModule } from 'src/mailing/mailing.module';
import { MailingService } from 'src/mailing/mailing.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  providers: [AuthResolver, UserService, PrismaService, AuthService, MailingService],
  exports: [AuthService],
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
    MailingModule
  ],
})
export class AuthModule {}
