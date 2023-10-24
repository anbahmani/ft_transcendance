import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Conversation } from './conversation.type';
import { User } from 'src/user/user.type';


@ObjectType('Membership')
export class Membership {
  @Field(type => Conversation)
  conversation: Conversation;

  @Field(type => User)
  user: User;
}
