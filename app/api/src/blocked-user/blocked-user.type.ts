import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BlockedUser {
  @Field(() => Int)
  blockerId: number;

  @Field(() => Int)
  blockedUser: number;
}
