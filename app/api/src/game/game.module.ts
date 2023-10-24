import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameService } from './game.service';
import { GameResolver } from './game.resolver';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Module({
	providers: [GameService, PrismaService, GameResolver, UserService, JwtService],
	exports: [GameService]
})
export class GameModule {}
