import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DataFriendship {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  ownerId: number;

  @Field(() => Int)
  receiverId: number;

  @Field()
  status: string;
}
