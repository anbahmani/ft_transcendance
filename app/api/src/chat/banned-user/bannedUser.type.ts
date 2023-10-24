import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/user.type';
import { Conversation } from '../conversation/entities/conversation.type';

@ObjectType('bannedUser')
export class BannedUser {
  @Field(() => Int)
  id: number;

  @Field(() => User)
  userBanned: User;

  @Field(() => Conversation)
  conversation: Conversation;
}
