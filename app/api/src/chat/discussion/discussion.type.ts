import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Message } from 'src/chat/message/message.type';
import { User } from 'src/user/user.type';

@ObjectType('discussion')
export abstract class Discussion {
  @Field(() => Int)
  id: number;

  @Field(type => [Message])
  messages: Message[];

  @Field(type => User)
  participant1: User;

  @Field(type => User)
  participant2: User;
}