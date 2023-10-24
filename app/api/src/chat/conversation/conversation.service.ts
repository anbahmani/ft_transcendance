import { Injectable } from '@nestjs/common';
import { Prisma, conversation } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MembershipService } from '../membership/membership.service';
import { ConversationManagementService } from '../conversation-management/conversation-management.service';
import { MessageService } from '../message/message.service';

@Injectable()
export class ConversationService {
	constructor(
		private prisma: PrismaService,
		private membershipService: MembershipService,
		private conversationManagementService: ConversationManagementService,
		private messageService: MessageService
	) {}

	async search(where: string) {
		const conversations = await this.prisma.conversation.findMany({
		  where: {
			name: {
			  contains: where 
			}
		  },
		  select: {
			// Specify the fields you want to retrieve from the Conversation model
			id: true,
			name: true,
			type: true,
			messages: {
			  orderBy: {
				date: 'desc'
			  },
			  take: 1,
			  select: {
				sender: true,
				content: true,
				date: true,
				id: true
			  }
			},
			members: {
			  select: {
				user: {
				  select: {
					id: true,
					login: true,
					image: true,
					login42: true,
					// Exclude password from user data
				  }
				}
			  }
			},
			admins: {
			  select: {
				user: {
				  select: {
					id: true,
					login: true,
					image: true,
					login42: true,
					// Exclude password from user data
				  }
				}
			  }
			},
			bannedUsers: {
				select: {
					userBanned: {
						select: {
							id: true,
							login: true,
							login42: true,
							image: true,
						}
					}
				}
			},
			mutes: {
				select: {
					user: {
						select: {
							id: true,
						}
					},
					mutedUntil: true
				}
			},
			owner: {
			  select: {
				id: true,
					login: true,
					image: true,
					login42: true,
				// Exclude password from user data
			  }
			}
		  }
		});
	  
		return conversations;
	  }
	



	async conversation(
	  where : Prisma.conversationWhereUniqueInput){
		  const conversation = await this.prisma.conversation.findUnique({
			  where: where,
			  select: {
				// Specify the fields you want to retrieve from the Conversation model
				id: true,
				name: true,
				type: true,
				messages: {
				  orderBy: {
					date: 'asc'
				  },
				  take: 20,
				  select: {
					sender: true,
					content: true,
					date: true,
					id: true
				  }
				},
				members: {
				  select: {
					user: {
					  select: {
						id: true,
						login: true,
						image: true,
						login42: true,
						// Exclude password from user data
					  },
					}
				  }
				},
				admins: {
				  select: {
					user: {
					  select: {
						id: true,
						login: true,
						image: true,
						login42: true,
						// Exclude password from user data
					  }
					}
				  }
				},
				owner: {
				  select: {
					id: true,
						login: true,
						image: true,
						login42: true,
					// Exclude password from user data
				  }
				},
				bannedUsers: {
					select: {
						userBanned: {
							select: {
								id: true,
								login: true,
								login42: true,
								image: true,
							}
						}
					}
				},
				mutes: {
					select: {
						user: {
							select: {
								id: true,
							}
						},
						mutedUntil: true
					}
				},
			  }
			});
		return conversation;
	  }

	  async conversationWithPW(
		where : Prisma.conversationWhereUniqueInput){
			const conversation = await this.prisma.conversation.findUnique({
				where: where,
				select: {
				  // Specify the fields you want to retrieve from the Conversation model
				  id: true,
				  name: true,
				  type: true,
				  password: true,
				  messages: {
					orderBy: {
					  date: 'asc'
					},
					take: 20,
					select: {
					  sender: true,
					  content: true,
					  date: true,
					  id: true
					}
				  },
				  members: {
					select: {
					  user: {
						select: {
						  id: true,
						  login: true,
						  image: true,
						  login42: true,
						  // Exclude password from user data
						},
					  }
					}
				  },
				  admins: {
					select: {
					  user: {
						select: {
						  id: true,
						  login: true,
						  image: true,
						  login42: true,
						  // Exclude password from user data
						}
					  }
					}
				  },
				  owner: {
					select: {
					  id: true,
						  login: true,
						  image: true,
						  login42: true,
					  // Exclude password from user data
					}
				  },
				  bannedUsers: {
					  select: {
						  userBanned: {
							  select: {
								  id: true,
								  login: true,
								  login42: true,
								  image: true,
							  }
						  }
					  }
				  },
				  mutes: {
					  select: {
						  user: {
							  select: {
								  id: true,
							  }
						  },
						  mutedUntil: true
					  }
				  },
				}
			  });
		  return conversation;
		}
	  
	async updateConversation(params: {
	  where: Prisma.conversationWhereUniqueInput;
	  data: Prisma.conversationUpdateInput;
	}): Promise<conversation> {
	  const { where, data } = params;
	  return this.prisma.conversation.update({
		data,
		where,
	  });
	}
  
	async allConversations(): Promise<conversation[]> {
		return this.prisma.conversation.findMany({
			include: {
				  members: {
					  select:
					  {
						  user: true
					  }
				  },
				  mutes: {
					select:
					  {
						  user: true
					  }
				  }
			  }
		});
	}

	async conversations(idUser: number): Promise<conversation[]> {
		const data = await this.prisma.conversation.findMany({
			where: {
			  members: {
				some: {
				  userId: idUser
				}
			  }
			},
			include: {
				messages: {
					orderBy: {
						date: 'desc'
					},
					take: 1,
					select: {
						sender: true,
						content: true,
						date: true,
						id: true
					}
				},
				owner: {
					select: {
					  	id: true,
						login: true,
						image: true,
						login42: true,
					  // Exclude password from user data
					}
				}
			}
		});
		return data;
	}
  
	async createConversation(data: Prisma.conversationCreateInput): Promise<conversation> {
		const conversation = await this.prisma.conversation.create({
			data: {
				name: data.name,
				type: data.type,
				password: data.password,
				owner: {
				  connect: {
					id: data.owner.connect.id,
				  },
				},
				messages: {
				  create: [{
					content: "Welcome to the conversation!",
					sender: {
					  connect: {
						id: data.owner.connect.id,
					  },
					},
				  }],
				},
				members: {
					create: [
					  {
						userId: data.owner.connect.id,
					  },
					],
				  },
				  admins: {
					create: [
					  {
						userId: data.owner.connect.id,
					  },
					],
				  },
			  },
			  
			  include: {
				messages: {
				  orderBy: {
					date: 'desc',
				  },
				  take: 1,
				  select: {
					sender: true,
					content: true,
					date: true,
					id: true,
				  },
				},
				members: {
					select: {
					  user: {
						select: {
						  id: true,
						  login: true,
						  image: true,
						  login42: true,
						  // Exclude password from user data
						},
					  }
					}
				  },
				  admins: {
					select: {
					  user: {
						select: {
						  id: true,
						  login: true,
						  image: true,
						  login42: true,
						  // Exclude password from user data
						}
					  }
					}
				  },
				  owner: {
					select: {
					  id: true,
						  login: true,
						  image: true,
						  login42: true,
					  // Exclude password from user data
					}
				  },
				  bannedUsers: {
					  select: {
						  userBanned: {
							  select: {
								  id: true,
								  login: true,
								  login42: true,
								  image: true,
							  }
						  }
					  }
				  },
				  mutes: {
					  select: {
						  user: {
							  select: {
								  id: true,
							  }
						  },
						  mutedUntil: true
					  }
				  },
			  },
			});
	  	return conversation;
	}
  
  
	async deleteConversation(conversationId: number): Promise<boolean> {
		await this.prisma.conversation.delete({
		  where: { id: conversationId },
		});
		return true;
	  }

	async updateConversationTypeAndRemovePassword(
		conversationId: number,
		newType: string
	  ): Promise<conversation> {
		return this.prisma.conversation.update({
		  where: { id: conversationId },
		  data: {
			type: newType,
			password: null,
		  },
		});
	  }

	  async getConversationPassword(conversationId: number) : Promise<string | null>{
		const conversation = await this.prisma.conversation.findUnique({
			where: {id: conversationId},
		});
		if (!conversation)
			throw new Error('Conversation ${conversation} not found');
		return conversation.password
	  }

	  async updatePassword(
		conversationId: number,
		password: string
	  ): Promise<conversation> {
		return this.prisma.conversation.update({
		  where: { id: conversationId },
		  data: {
			password: password,
		  },
		});
	  }

	  async getType(conversationId: number): Promise<string> {
		const conversation = await this.prisma.conversation.findUnique({where: {id: conversationId}})
		return conversation.type;
	  }

	  async muteUser(conversationId: number, userId: number, mutedUntil: Date): Promise<conversation> {
		return this.prisma.conversation.update({
		  where: { id: conversationId },
		  data: {
			mutes: {
			  create: {
				userId: userId,
				mutedUntil: mutedUntil
			  }
			},
		}
	});
	}
}
