import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DiscussionService } from './discussion.service';
import { Discussion } from './discussion.type';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Resolver()
export class DiscussionResolver {
  constructor(private readonly discussionService: DiscussionService) {}

  @UseGuards(AuthGuard)
  @Query(() => [Discussion])
  async getAllUserDiscussions(@Context() { req, res }) {
	if (req.user['user'])
    	return this.discussionService.discussions(req.user['user']['id']);
	throw new UnauthorizedException();
  }

  // @UseGuards(AuthGuard)
  @Mutation(() => Discussion)
  async getDiscussionById(@Context() { req, res }, @Args('id') id: number) {
    let discussion = await this.discussionService.getDiscussionByIdSenderAndIdReceiver(0,0,id);
    if(!discussion)
      throw new UnauthorizedException("No discussion found");
    return discussion;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Discussion)
  async createDiscussion(@Context() { req, res }, @Args('userId') userId: number) {
    let discussion = await this.discussionService.getDiscussionByIdSenderAndIdReceiver(req.user['user']['id'], userId);
    if (!discussion)
      return await this.discussionService.createDiscussion(req.user['user']['id'], userId);
    return discussion;
  }
}
