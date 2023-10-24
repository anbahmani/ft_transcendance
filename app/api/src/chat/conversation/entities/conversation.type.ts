import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Message } from 'src/chat/message/message.type';
import { User } from 'src/user/user.type';
import { Membership } from './membership.type';
import { ConversationManagement } from 'src/chat/conversation-management/conversation-management.type';
import { BannedUser } from 'src/chat/banned-user/bannedUser.type';
import { MutedUser } from './muted-user.type';

@ObjectType('conversation')
export abstract class Conversation {
  @Field(() => Int)
  id: number;

  @Field({nullable: true})
  name: string;

  @Field(type => [Message])
  messages: Message[];

  @Field()
  type: string;

  @Field(type => String, {nullable: true})
  password?: string;

  @Field(type => [Membership])
  members: Membership[];

  @Field(type => User)
  owner: User;

  @Field(type => [ConversationManagement], {nullable: true})
  admins: ConversationManagement[];

  @Field(type => [BannedUser])
  bannedUsers: BannedUser[];

  @Field(type => [MutedUser])
  mutes: MutedUser[];
}