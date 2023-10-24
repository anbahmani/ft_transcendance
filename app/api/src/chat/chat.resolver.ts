import { Query, Resolver, Int, Context } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Conversation } from './conversation/entities/conversation.type';
import { conversation, discussion } from '@prisma/client';
import { Discussion } from './discussion/discussion.type';

@Resolver()
export class ChatResolver {
	constructor(private readonly chatService: ChatService){}

	@Query(() => [Conversation, Discussion])
  async getAllUserConversationsAndDiscussions(@Context() req): Promise<(conversation | discussion)[]> {
    if (req.user['user'])
		return this.chatService.getConversationsAndDiscussionsByUserId(1);
  }
}
