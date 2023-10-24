import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './user/user.module';
// import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { AuthResolver } from './auth/auth.resolver';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PrismaModule } from './prisma/prisma.module';
import { User } from './user/user.type';
import { ChatGateway } from './chat/chat.gateway';
import { MailingModule } from './mailing/mailing.module';
import { FriendshipModule } from './friendship/friendship.module';
import { FriendshipService } from './friendship/friendship.service';
import { Friendship } from './friendship/friendship.type';
import { ConversationModule } from './chat/conversation/conversation.module';
import { ConversationManagementService } from './chat/conversation-management/conversation-management.service';
import { ConversationManagementModule } from './chat/conversation-management/conversation-management.module';
import { GameSocketModule } from './gamesocket/gamesocket.module';
import { BannedUserService } from './chat/banned-user/banned-user.service';
import { BannedUserModule } from './chat/banned-user/banned-user.module';
import { ConversationService } from './chat/conversation/conversation.service';
import { MembershipService } from './chat/membership/membership.service';
import { MessageService } from './chat/message/message.service';
import { DiscussionService } from './chat/discussion/discussion.service';
import { Game } from './game/game.type';
import { GameModule } from './game/game.module';
import { GameService } from './game/game.service';
import { SocketModule } from './socket/socket.module';
import { ChatModule } from './chat/chat.module';
import { ChatResolver } from './chat/chat.resolver';
import { ChatService } from './chat/chat.service';
import { DiscussionModule } from './chat/discussion/discussion.module';
import { Discussion } from './chat/discussion/discussion.type';
import { MessageModule } from './chat/message/message.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      buildSchemaOptions: {
        orphanedTypes: [User, Friendship, Game, Discussion], // Ajoutez la classe User ici
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../..', 'client', 'dist'),
    }),
    UserModule,
    AuthModule,
    HttpModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    MailingModule,
    FriendshipModule,
    GameSocketModule,
    ConversationModule,
    ConversationManagementModule,
    BannedUserModule,
    GameModule,
	  SocketModule,
	  ChatModule,
	  DiscussionModule,
    MessageModule
  ],
  providers: [AuthResolver, ConversationManagementService, BannedUserService,  ConversationService, MembershipService, MessageService, DiscussionService, FriendshipService, GameService, ChatService, ChatResolver],
})
export class AppModule {}
