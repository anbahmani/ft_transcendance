import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/user/user.type";

@ObjectType()
export class Game {
	@Field(() => Int)
	id: number;

	@Field()
	type: string;

	@Field(() => Int)
	player1Id: number;

	@Field(() => Int)
	player2Id: number;

	@Field(() => User)
	player1: User;

	@Field(() => User)
	player2: User;

	@Field(() => Int)
	winnerId: number;

	@Field(() => User)
	winner: User;

	@Field()
	status: string;
}