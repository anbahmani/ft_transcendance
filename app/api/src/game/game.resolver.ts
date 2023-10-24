import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { GameService } from './game.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';
import { Game } from './game.type';
import * as os from 'os';

@Resolver(() => Game)
export class GameResolver {
    constructor(private readonly gameService: GameService, private readonly userService: UserService) {}

    @UseGuards(AuthGuard)
    @Mutation(() => Game)
    async createGame(@Context() { req }, @Args('type', {type: ()=> String}) type: string, @Args('userId', {type: ()=> Int}) user: number) {

        const host = {connect: {id : req.user['user']['id']}};
        const game = await this.gameService.createGame({
            player1: host,
            player2: {connect: {id : user}},
            winner: host,
            type: type,
            status: "Playing"
        });
        return game;
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Game)
    async updateGame(@Args('id', {type: ()=> Int}) id: number, @Args('status', {type: ()=> String}) status: string, @Args('userId', {type: ()=> Int}) user: number) {

        const winner = {connect: {id : user}};

        const updated = await this.gameService.updateGame({
            where: {id: id},
            data: {
                winner: winner,
                status: status,
            }});
            return updated;
    }

    // @UseGuards(AuthGuard)
    // @Query(() => [Game])
    // async getAllGamesFromId(@Context() { req }, @Args('userId', {type: ()=> Int}) userId: number) {

    //     const user = {connect : {id : userId}};

    //     const ret = await this.gameService.getAllPlayedGamesByUser(user.connect.id);

    //     return ret;
    // }

    @UseGuards(AuthGuard)
    @Query(() => [Game])
    async getAllGamesFromId(@Context() { req }, @Args('userId', {type: ()=> Int}) userId: number) {

        const user = {connect : {id : userId}};

        //console.log("getGamesFromId user = ", user.connect.id);

        const ret = await this.gameService.getAllPlayedGamesByUser(user.connect.id);

        return ret;
    }

    @UseGuards(AuthGuard)
    @Query(() => [Game])
    async getGamesFromId(@Context() { req }, @Args('take', {type: ()=> Int}) take: number, @Args('userId', {type: ()=> Int}) userId: number) {

        const user = {connect : {id : userId}};

        const ret = await this.gameService.getPlayedGamesByUser(user.connect.id, take);
        return ret;
    }

    @UseGuards(AuthGuard)
    @Mutation(() => [Game])
    async Games(@Context() { req }, @Args('take', {type: ()=> Int}) take: number, @Args('userId', {type: ()=> Int}) userId: number) {

        const user = {connect : {id : userId}};

        const ret = await this.gameService.getPlayedGamesByUser(user.connect.id, take);
        return ret;
    }

    @UseGuards(AuthGuard)
    @Query(() => Game)
    async getPlayedGamesByUser(@Context() { req }, @Args('take', {type: ()=> Int}) take: number) {

        return await this.gameService.getPlayedGamesByUser(parseInt(req.user['user']['id']), take);
    }

    @UseGuards(AuthGuard)
    @Query(() => Game)
    async getWonGamesByUser(@Context() { req }, @Args('take', {type: ()=> Int}) take: number) {

        return await this.gameService.getWonGamesByUser(parseInt(req.user['user']['id']));
    }
}
