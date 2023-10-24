import { Resolver, Query, Mutation, Args, Int, Context, Subscription } from '@nestjs/graphql';
import { Friendship } from './friendship.type';
import { FriendshipService } from './friendship.service';
import { UserService } from 'src/user/user.service';
import { UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Resolver(() => Friendship)
export class FriendshipResolver {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
    ) {}


  @UseGuards(AuthGuard)
  @Mutation(() => Friendship)
  async createFriendship(@Context() { req }, @Args('userId', {type: ()=> Int}) user: number) {
    
    const newFriendship = await this.friendshipService.createFriendship({
      owner: {connect : {id : user}},
      receiver : {connect : {id : req.user['user']['id']}},
      status: 'Pending'});


    return newFriendship;
  }

  @UseGuards(AuthGuard)
  @Query(() => [Friendship])
  async findAll() {
    const friendships = await this.friendshipService.friendships({ orderBy: { status: 'asc' } });
    return friendships;
  }

  @UseGuards(AuthGuard)
  @Query(() => Friendship, { name: 'friendship' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return await this.friendshipService.friendship({id});
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Friendship)
  async updateFriendship(@Context() { req }, @Args('status', {type: ()=> String}) status: string, @Args('id', {type: ()=> Int}) id: number) {

    const updated = await this.friendshipService.updateFriendship({where :{id : id}, data : {status : status}});
    return updated;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Friendship)
  async removeFriendship(@Context() { req }, @Args('friendship', {type: ()=> Int}) friendship: number) {
    const removed = await this.friendshipService.deleteFriendship({id:friendship});
    return removed;
  }
}
