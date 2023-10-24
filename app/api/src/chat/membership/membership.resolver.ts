// import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
// import { Membership } from './membership.type';
// import { MembershipService } from './membership.service';
// @Resolver(() => Membership)
// export class MembershipResolver {
//   constructor(private readonly membershipService: MembershipService) {}

//   @Mutation(() => String)
//   addUserToConversation(
//     @Args('conversationId', { type: () => Int }) conversationId: number,
//     @Args('userId', { type: () => Int }) userId: number,
//   ): Promise<{ status: string }> {
//     return this.membershipService.addUserToConversation(conversationId, userId);
//   }
// }
