import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ListBlockedUser {
  @Field(() => Int)
  id: number;

  @Field()
  admin: boolean;
}
