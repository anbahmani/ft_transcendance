import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent, Context } from '@nestjs/graphql';
import { ConversationService } from './conversation.service';
import { Conversation } from './entities/conversation.type';
import { Prisma, conversation } from '@prisma/client';
import { User } from 'src/user/user.type';
import { UserService } from 'src/user/user.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { MessageService } from '../message/message.service';
import { MembershipService } from '../membership/membership.service';
import { BannedUserService } from '../banned-user/banned-user.service';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { ConversationManagementService } from '../conversation-management/conversation-management.service';
import * as bcrypt from 'bcrypt';


@Resolver(() => Conversation)
export class ConversationResolver {
  constructor(
	private readonly conversationService: ConversationService,
	private readonly userService: UserService,
	private readonly msgService: MessageService,
	private readonly membershipService: MembershipService,
	private readonly bannUserService: BannedUserService,
	private readonly conversationManagementService: ConversationManagementService
	) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Conversation)
  async createConversation(@Context() { req, res },
   @Args('name') name: string,
   @Args('type', { type: () => String }) type: string,
   @Args('password', { type: () => String, nullable: true }) password?: string) {
    const saltRounds = 10;

    try {
        if (password) {
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);

            const conversationData = {
                name: name,
                type: type,
                password: hash,
                members: undefined,
                messages: undefined,
                owner: {
                    connect: {
                        id: req.user['user'].id
                    }
                },
                admins: undefined
            };

            return this.conversationService.createConversation(conversationData);
        } else {
            const conversationData = {
                name: name,
                type: type,
                password: undefined,
                members: undefined,
                messages: undefined,
                owner: {
                    connect: {
                        id: req.user['user'].id
                    }
                },
                admins: undefined
            };

            return this.conversationService.createConversation(conversationData);
        }
    } catch (e) {
        throw new UnauthorizedException('Error');
    }
}

  @UseGuards(AuthGuard)
  @Query(() => [Conversation])
  async getAllUserConversations(@Context() { req, res }) {
	if (req.user['user']){
		const idUser = req.user['user'].id;
    	return this.conversationService.conversations(idUser);
	}
	throw new UnauthorizedException();
  }

  @UseGuards(AuthGuard)
  @Mutation(() => [Conversation])
  async searchConversation(@Context() { req, res }, @Args('name') name: string) {
	  // if (req.user['user'])
    	return this.conversationService.search(name);
		// throw new UnauthorizedException();
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Conversation)
  async findOne(@Args('idConversation') idConversation: number) {
	if (idConversation === 0) {
		return new UnauthorizedException('Conversation not found');
	}
	const conversation = await this.conversationService.conversation({id: idConversation});
	if (!conversation) {
	  throw new Error('Conversation not found');
	}
    return conversation;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Conversation)
  async updateConversation(	@Args('idConversation') idConversation: number,
  							@Args('type') type?: string,
							@Args('password') password?: string) {
								const saltRounds = 10;

								
							const salt = await bcrypt.genSalt(saltRounds);
							const hash = await bcrypt.hash(password, salt);
    return this.conversationService.updateConversation({
		where: {
			id: idConversation
		},
		data: {type, password: hash
		}
	});
  }

@UseGuards(AuthGuard)
@Mutation(() => Conversation)
async updateConversationTypeAndRemovePassword(
  @Args('conversationId', { type: () => Int }) conversationId: number,
  @Args('newType', { type: () => String }) newType: string
) {
  return this.conversationService.updateConversationTypeAndRemovePassword(conversationId, newType);
}

@Mutation(() => Boolean)
async deleteConversation(
  @Args('conversationId', { type: () => Int }) conversationId: number
){
  return this.conversationService.deleteConversation(conversationId);
}

@ResolveField('users', returns => [User])
async getUsers(@Parent() conversation: Conversation) {
    const { id } = conversation;
    return this.userService.getUsersByConversationId(id);  // vous devez implémenter cette méthode dans votre service User
  }

@UseGuards(AuthGuard)
@Mutation(() => Conversation)
async AddUserToConversation(
	@Args('conversationId', { type: () => Int }) conversationId: number,
	@Args('userId', { type: () => Int }) userId: number,
	@Args('password', { type: () => String, nullable: true }) password: string,
	@Context() { req, res }
  ) {
	const conversation = await this.conversationService.conversation({id: conversationId});
	if (!conversation) {
		throw new UnauthorizedException('Conversation not found');
	}
	if(conversation.type === 'private' && conversation.owner.id !== req.user['user'].id && !conversation.admins.find((admin) => admin.user.id === req.user['user'].id)) {
		throw new UnauthorizedException('Conversation is private');
	}
	if(conversation.type === 'protected' && conversation.owner.id !== req.user['user'].id) {
		throw new UnauthorizedException('Conversation is protected');
	}
	this.membershipService.addUserToConversation(userId, conversationId).then(() => {
		
	}).catch((err) => {
		return UnauthorizedException;
	});
	return conversation;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Conversation)
  async JoinConversation(
	  @Args('conversationId', { type: () => Int }) conversationId: number,
	  @Args('password', { type: () => String, nullable: true }) password: string,
	  @Context() { req, res }
	) {
	  const conversation = await this.conversationService.conversationWithPW({id: conversationId});
	  if (!conversation) {
		  throw new UnauthorizedException('Conversation not found');
	  }
	  if(conversation.type === 'private' && conversation.owner.id !== req.user['user'].id) {
		  throw new UnauthorizedException('Conversation is private');
	  }
	  if (conversation.type === 'protected') {
        if (!password) {
            throw new UnauthorizedException('Password is required for a protected conversation');
        }

        // Utilisation de bcrypt.compare pour vérifier le mot de passe.
        const passwordMatch = await bcrypt.compare(password, conversation.password);

        if (!passwordMatch) {
            throw new UnauthorizedException('Incorrect password for protected conversation');
        }
    }
	  this.membershipService.addUserToConversation(req.user['user'].id, conversationId).then(() => {
		  
	  }).catch((err) => {
		  return UnauthorizedException;
	  });
	  conversation.password = '';
	  return conversation;
	}

@UseGuards(AuthGuard)
@Mutation(() => Conversation)
async KickUser(
	@Args('conversationId', { type: () => Int }) conversationId: number,
	@Args('userId', { type: () => Int }) userId: number,
	@Context() { req, res }
  ) {
	const conversation = await this.conversationService.conversation({id: conversationId});
	if (!conversation) {
		throw new UnauthorizedException('Conversation not found');
	}
	if( (conversation.owner.id !== req.user['user'].id && conversation.admins.find((admin) => admin.user.id === req.user['user'].id))) {
		throw new UnauthorizedException('You are not allowed to kick this user');
	}
	this.membershipService.removeUserFromConversation(userId, conversationId).then(() => {
		
	}).catch((err) => {
		return UnauthorizedException;
	});
	return conversation;
  }

//   @UseGuards(AuthGuard)
//   @Mutation(() => Conversation)
//   async MuteUser(
// 	  @Args('conversationId', { type: () => Int }) conversationId: number,
// 	  @Args('userId', { type: () => Int }) userId: number,
// 	  @Context() { req, res }
// 	) {
// 	  const conversation = await this.conversationService.conversation({id: conversationId});
// 	  if (!conversation) {
// 		  throw new UnauthorizedException('Conversation not found');
// 	  }
// 	//   if( (conversation.owner.id !== req.user['user'].id && conversation.admins.find((admin) => admin.user.id === req.user['user'].id))) {
// 	// 	  throw new UnauthorizedException('You are not allowed to kick this user');
// 	//   }
// 	  this.membershipService.removeUserFromConversation(userId, conversationId).then(() => {
		  
// 	  }).catch((err) => {
// 		  return UnauthorizedException;
// 	  });
// 	  return conversation;
// 	}


  @UseGuards(AuthGuard)
  @Mutation(() => Conversation)
  async MuteUser(
	  @Args('conversationId', { type: () => Int }) conversationId: number,
	  @Args('userId', { type: () => Int }) userId: number,
	  @Context() { req, res }
	) {
	  const conversation = await this.conversationService.conversation({id: conversationId});
	  console.log("conversation: ", conversation);
	  if (!conversation) {
		  throw new UnauthorizedException('Conversation not found');
	  }
	  if( (conversation.owner.id !== req.user['user'].id && conversation.admins.find((admin) => admin.user.id === req.user['user'].id))) {
		  throw new UnauthorizedException('You are not allowed to kick this user');
	  }
	  const currentDate = new Date();
	  currentDate.setHours(currentDate.getHours() + 1);
	  this.conversationService.muteUser(conversationId, userId, currentDate).then(() => {
		  
	  }).catch((err) => {
		  return UnauthorizedException;
	  });
	  return conversation;
	}


  @UseGuards(AuthGuard)
  @Mutation(() => Conversation)
  async BanUser(
	@Args('conversationId', { type: () => Int }) conversationId: number,
 	@Args('userId', { type: () => Int }) userId: number,
 	@Context() { req, res }
	) {
		const conversation = await this.conversationService.conversation({id: conversationId});
		if (!conversation) {
			throw new UnauthorizedException('Conversation not found');
		}
		if( (conversation.owner.id !== req.user['user'].id && conversation.admins.find((admin) => admin.user.id === req.user['user'].id))) {
			throw new UnauthorizedException('You are not allowed to bann this user');
		}
		const currUser = req.user['user'].id;
		this.bannUserService.banUserFromConversation(userId, conversationId, currUser).then(() => {}).catch((err) => {
			return UnauthorizedException;
		});
		return conversation;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Conversation)
  async UnBanUser(
	@Args('conversationId', { type: () => Int }) conversationId: number,
 	@Args('userId', { type: () => Int }) userId: number,
 	@Context() { req, res }
	) {
		const conversation = await this.conversationService.conversation({id: conversationId});
		if (!conversation) {
			throw new UnauthorizedException('Conversation not found');
		}
		if( (conversation.owner.id !== req.user['user'].id && conversation.admins.find((admin) => admin.user.id === req.user['user'].id))) {
			throw new UnauthorizedException('You are not allowed to bann this user');
		}
		// const currUser = req.user['user'].id;
		this.bannUserService.unbanUserFromConversation(userId, conversationId).then(() => {}).catch((err) => {
			return UnauthorizedException;
		});
		return conversation;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Conversation)
  async quitConversation(
	@Context() { req, res },
	@Args('conversationId', { type: () => Int }) conversationId: number
  ) {
	const conversation = await this.conversationService.conversation({id: conversationId});
	if (!conversation) {
		throw new UnauthorizedException('Conversation not found');
	}
	if (req.user && req.user['user']) {
		const currUserId = req.user['user'].id;
		if (currUserId) {
			this.membershipService.removeUserFromConversation(currUserId, conversationId).then(() => {
			
			}).catch((err) => {
				return UnauthorizedException;
			});
			return conversation;
		}
	}
	return UnauthorizedException;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Conversation)
  async setAdmin(
	@Context() { req, res },
	@Args('conversationId', { type: () => Int }) conversationId: number,
	@Args('userId', { type: () => Int }) userId: number
  ) {
	const conversation = await this.conversationService.conversation({id: conversationId});
	if (!conversation) {
		throw new UnauthorizedException('Conversation not found');
	}
	if( (conversation.owner.id !== req.user['user'].id)) {
		throw new UnauthorizedException('You are not allowed to bann this user');
	}
	this.conversationManagementService.addAdminToConversation(conversationId, userId).then(() => {
	}).catch((err) => {
		return UnauthorizedException;
	});
	return conversation;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Conversation)
  async unsetAdmin(
	@Context() { req, res },
	@Args('conversationId', { type: () => Int }) conversationId: number,
	@Args('userId', { type: () => Int }) userId: number
  ) {
	const conversation = await this.conversationService.conversation({id: conversationId});
	if (!conversation) {
		throw new UnauthorizedException('Conversation not found');
	}
	if( (conversation.owner.id !== req.user['user'].id)) {
		throw new UnauthorizedException('You are not allowed to bann this user');
	}
	this.conversationManagementService.removeAdminFromConversation(conversationId, userId).then(() => {
	}).catch((err) => {
		return UnauthorizedException;
	});
	return conversation;
  }
}
