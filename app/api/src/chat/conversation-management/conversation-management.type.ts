import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/user/user.type';
import { Conversation } from '../conversation/entities/conversation.type';

@ObjectType()
export class ConversationManagement {
  @Field(type => User)
  user: User;

  @Field(type => Conversation)
  conversation: Conversation;
}
