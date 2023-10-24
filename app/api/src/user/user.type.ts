import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Friendship } from 'src/friendship/friendship.type';
import { Message } from 'src/chat/message/message.type';
import { Conversation } from 'src/chat/conversation/entities/conversation.type';

@ObjectType('user')
export abstract class User {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  id42: number;

  @Field({ nullable: true })
  login: string;

  @Field()
  login42: string;

  @Field()
  first_name:string

  @Field()
  last_name:string

  @Field()
  email:string

  @Field()
  url:string

  @Field()
  image:string

  @Field({ nullable: true })
  token:string

  @Field()
  isVerified:boolean
  
  @Field(() => [Friendship], { nullable: true })
  follow:    Friendship[]

  @Field(() => [Friendship], { nullable: true })
  followers:  Friendship[]
  
  @Field(type => [Conversation], { nullable: true })
  conversations: Conversation[];

  @Field(type => [Conversation], {nullable: true})
  conversationsOwner: Conversation[];

  @Field(type => [Message], {nullable: true})
  messagesSent: Message[];
}
