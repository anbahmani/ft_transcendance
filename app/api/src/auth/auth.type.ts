import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Auth')
export abstract class Auth {

  @Field(() => String, { nullable: true })
  public accessToken: string;

  @Field(() => String, { nullable: true })
  public email: string;
}