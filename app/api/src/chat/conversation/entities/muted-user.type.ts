import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Conversation } from './conversation.type';
import { User } from 'src/user/user.type';


@ObjectType('mutedUser')
export class MutedUser {
  @Field(type => Conversation)
  conversation: Conversation;

  @Field(type => User)
  user: User;

  @Field(type => Date)
  mutedUntil: Date;
}