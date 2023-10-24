import { Injectable } from '@nestjs/common';
import { Prisma, game } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}


	async createGame(data: Prisma.gameCreateInput): Promise<game> {
		return this.prisma.game.create({
			data,
		});
	}

	async updateGame(params: {
		where: Prisma.gameWhereUniqueInput;
		data: Prisma.gameUpdateInput;
	}): Promise<game> {
		const { where, data } = params;
		return this.prisma.game.update({
			data,
			where,
		});
	}
	async getWonGamesByUser(idUser: number): Promise<game[]> {
		return this.prisma.game.findMany({
			where: {
				winnerId: idUser
			},
			orderBy: {
				id: 'desc'
			}
		})
	}

	async getAllPlayedGamesByUser(idUser: number): Promise<game[]> {
		return this.prisma.game.findMany({
			where: {
				OR:[
					{
						player1Id: idUser
					},
					{
						player2Id: idUser
					}
				]
			},
			orderBy: {
				id: 'desc'
			},
			include: {
				player1: 
				{
					select: {
						id: true,
						login: true,
						login42: true,
						image: true,
					}
				},
				player2: 
				{
					select: {
						id: true,
						login: true,
						login42: true,
						image: true,
					}
				},
			}
		});
	}

	async getPlayedGamesByUser(idUser: number, take?: number): Promise<game[]> {
		return this.prisma.game.findMany({
			where: {
				OR:[
					{
						player1Id: idUser
					},
					{
						player2Id: idUser
					}
				]
			},
			take: take,
			orderBy: {
				id: 'desc'
			},
			include: {
				player1: 
				{
					select: {
						id: true,
						login: true,
						login42: true,
						image: true,
					}
				},
				player2: 
				{
					select: {
						id: true,
						login: true,
						login42: true,
						image: true,
					}
				},
			}
		});
	}
}
