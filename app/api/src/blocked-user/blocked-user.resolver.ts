import { Args, Context, Int, Mutation, Resolver, Query } from '@nestjs/graphql';
import { BlockedUser } from './blocked-user.type';
import { ListBlockedUser } from './listblock-user.type';
import { BlockedUserService } from './blocked-user.service';
import { UserService } from 'src/user/user.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/user.type';


type FormatBlock = {
	id: number;
	admin: boolean;
};

@Resolver(() => BlockedUser)
export class BlockedUserResolver {
	constructor(private readonly blockedUserService: BlockedUserService, private readonly userService: UserService){}

	@UseGuards(AuthGuard)
 	@Mutation(() => BlockedUser)
  	async blockUser(@Context() { req }, @Args('userId', {type: ()=> Int}) user: number) { 
    	await this.blockedUserService.blockUser(
        	req.user['user']['id'],
			user
		);

		const block: BlockedUser = {blockerId: 0, blockedUser: 0};

		return block;
  	}


	@UseGuards(AuthGuard)
	@Mutation(() => BlockedUser)
	async removeBlockedUser(@Context() { req }, @Args('userId', {type: ()=> Int}) user: number) {
		await this.blockedUserService.unblockUser(
			req.user['user']['id'],
			user
		);

		const block: BlockedUser = {blockerId: 0, blockedUser: 0};

		return block;
	}

	// @UseGuards(AuthGuard)
	@Query(() => [User])
	async getBlocked(@Context() { req }){
		return await this.blockedUserService.getBlockedUsers(1);
	}

	@UseGuards(AuthGuard)
	@Query(() => [ListBlockedUser])
	async formatListBlock(@Context() { req }) {
		const user = req.user['user']['id'];

		const list = await this.blockedUserService.listBlocked(user);
		const blocks: FormatBlock[] = [];

		for (const item of list) {
			const block: FormatBlock = {
				id: 0,
				admin: false,
			};
			if (user === item.blockedById) {
				block.id = item.blockedUserId;
				block.admin = true;
			}
			else {
				block.id = item.blockedById;
				block.admin = false;
			}
			blocks.push(block);
		}

		return blocks;
	}
}
