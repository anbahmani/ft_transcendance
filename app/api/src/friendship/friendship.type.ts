import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/user/user.type';

@ObjectType()
export class Friendship {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  ownerId: number;

  @Field(() => Int)
  receiverId: number;

  @Field(() => User)
  owner: User;

  @Field(() => User)
  receiver: User;

  @Field()
  status: string;
}
