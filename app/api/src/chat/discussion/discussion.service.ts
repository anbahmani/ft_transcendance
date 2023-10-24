import { Injectable } from '@nestjs/common';
import { discussion } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DiscussionService {
	constructor(private prisma: PrismaService){}

	async getDiscussionByIdSenderAndIdReceiver(idSender?: number, idReceiver?: number, id?: number): Promise<discussion | null> {
		return this.prisma.discussion.findFirst({
			where: {
			  OR: [
				{
				  AND: [
					{ participant1Id: idSender },
					{ participant2Id: idReceiver },
				  ],
				},
				{
				  AND: [
					{ participant1Id: idReceiver },
					{ participant2Id: idSender },
				  ],
				},
				{ id: id },
			  ],
			},
			include: {
				messages: {
					include: {
						sender: {
							select: {
								id: true,
								login: true,
								image: true,
								login42: true,
							}
						}
					}
				},
				participant1: {
					select: {
						id: true,
						login: true,
						image: true,
						login42: true,
					}
				},
				participant2: {
					select: {
						id: true,
						login: true,
						image: true,
						login42: true,
					}
				}
			}
		  });
	}

	async createDiscussion(participant1Id: number, participant2Id: number): Promise<discussion> {
		return this.prisma.discussion.create({
		  data: {
			participant1Id: participant1Id,
			participant2Id: participant2Id,
			messages: {
				create: {
					content: "Started the chat",
					sender: {
						connect: { id: participant1Id } // L'expéditeur du premier message
					  },
					date: new Date()
				}
			}
		  },
		  include: {
			messages: 
				{
					take: 1,
					include: {
						sender: {
							select: {
								id: true,
								login: true,
								image: true,
								login42: true,
							}
						}
					}
				},
				participant1: {
					select: {
						id: true,
						login: true,
						image: true,
						login42: true,
					}
				},
				participant2: {
					select: {
						id: true,
						login: true,
						image: true,
						login42: true,
					}
				}
			}
		  });
	  }
	  

	  async discussions(idUser: number): Promise<discussion[]> {
		return this.prisma.discussion.findMany({
			where: {
				OR: [
				  { participant1Id: idUser },
				  { participant2Id: idUser },
				],
			  },
			  include: {
				  messages: 				
				  {
					take: 1,
					include: {
						sender: {
							select: {
								id: true,
								login: true,
								image: true,
								login42: true,
							}
						}
					}
				},
			  participant1: {
				select: {
					id: true,
					first_name: true,
					last_name: true,
					image: true,
					login: true,
					login42: true,
				}
			}, // Include participant 1 names and id
			participant2: {
				select: {
					id: true,
					first_name: true,
					last_name: true,
					image: true,
					login: true,
					login42: true,
				}
			}, // Include participant 2 names and id
			}
		});
	}
}
