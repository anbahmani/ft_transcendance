import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/user/user.type';
import { Conversation } from '../conversation/entities/conversation.type';
import { Discussion } from '../discussion/discussion.type';

@ObjectType('message')
export abstract class Message {
  @Field(() => Int)
  id: number;

  @Field(type => User)
  sender: User;

  @Field(type => Date)
  date: Date;

  @Field()
  content: string;

  @Field(type => Conversation, {nullable: true})
  conversation?: Conversation;

  @Field(type => Discussion, {nullable: true})
  discussion?: Discussion;

  @Field()
  type?: string;
}