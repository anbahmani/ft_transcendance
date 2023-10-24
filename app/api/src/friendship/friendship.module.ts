import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendshipResolver } from './friendship.resolver';
import { FriendshipService } from './friendship.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
//import { SocketGateway } from 'src/socket/socket.gateway';
//import { SocketService } from 'src/socket/socket.service';

@Module({
  providers: [PrismaService, 
    FriendshipResolver, 
    FriendshipService, 
    UserService, 
    JwtService,
    //SocketGateway,
    //SocketService,
  ],
  exports: [FriendshipService]
})
export class FriendshipModule {}
