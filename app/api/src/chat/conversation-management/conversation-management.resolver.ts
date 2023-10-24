import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { ConversationManagementService } from './conversation-management.service';
import { ConversationManagement } from './conversation-management.type';
@Resolver(() => ConversationManagement)
export class ConversationManagementResolver {
  constructor(private readonly conversationManagementService: ConversationManagementService) {}

  @Mutation(() => ConversationManagement)
  addAdminToConversation(
    @Args('conversationId', { type: () => Int }) conversationId: number,
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<ConversationManagement> {
    return this.conversationManagementService.addAdminToConversation(conversationId, userId);
  }
}
