import { Resolver, Query, Mutation, Args, Int, Context, Subscription } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.type';
import { AuthService } from 'src/auth/auth.service';
import { BadRequestException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { Prisma, user } from '@prisma/client';
import { BlockedUserService } from 'src/blocked-user/blocked-user.service';
import { PubSub } from 'graphql-subscriptions';
import { MailingService } from 'src/mailing/mailing.service';
import  * as path from 'path';

const pubSub = new PubSub();

@Resolver(() => User)
export class UserResolver {
  constructor(	private readonly userService: UserService,
				private readonly authService: AuthService,
				private readonly blockedUserService: BlockedUserService,
        private readonly mailService: MailingService
			) {}

  // @Mutation(() => User)
  // async createUser(@Args('createUserInput') createUserInput: Prisma.userCreateInput) {
  //   return this.userService.createUser(createUserInput);
  // }

  // @Query(() => [User], { name: 'user' })
  // findAll() {
  //   return this.userService.findAll();
  // }

  @Subscription(() => User, {
    name: 'userUpdated',
  })
  userUpdated() {
    return pubSub.asyncIterator('userUpdated');
  }

  @UseGuards(AuthGuard)
  @Query(() => User, { name: 'user' })
  async findOne(
	@Args('email', { type: () => String, nullable: true }) email?: string,
	@Args('id', { type: () => Int, nullable: true }) id?: number
  ) {
	if (email) {
	  return this.userService.user({ email });
	}
	if (id) {
	  return this.userService.user({ id });
	}
	throw new BadRequestException('Missing argument');
  }


  @Query(() => User)
  async getUserById(@Args('userId', {type: ()=> Int}) id: number) {
    return this.userService.user({id: id});
  }


  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async activate2Fa(@Context() { req, res })
  {
    console.log("test");
    if (req.user['user']['isVerified'])
    {
      console.log("deja active");
      try
      {
        const updatedUser = await this.userService.updateUser({
          where: { email: req.user['user']['email'] },
          data: { isVerified: false},
        });
        return (updatedUser);
      }
      catch (e)
      {
        console.log(e);
        return UnauthorizedException;
      }
    }
    else
    {
      console.log("desactive");
      try
      {
        
        const updatedUser = await this.userService.updateUser({
          where: { email: req.user['user']['email'] },
          data: {token : `${Math.floor(Math.random() * (9999 - 1000) + 1000)}`},
        });

        await this.mailService.setTransport({
          transporterName: 'gmail',
          to: updatedUser.email, // list of receivers
          subject: '42 PONG : Verficiaction Code', // Subject line
          template: 'action',
          html: `<p style="text-align: center; font-size: 10em">Code : ${updatedUser.token}</p>`,
        });
        updatedUser.token = '';
        //console.log("Returning user: ", updatedUser);
        return (updatedUser);
      }
      catch (e)
      {
        console.log(e);
        return UnauthorizedException;
      }
    }
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async updateUser(@Context() { req, res }, 
  @Args('login', { type: () => String, nullable:true  }) login: string,
  @Args('email', { type: () => String, nullable:true  }) email: string,
  @Args('file', { type: () => GraphQLUpload, nullable:true }) file?: GraphQLUpload) {
    const tmp = await file;
    const user_data = {login : login ? login : req.user['user']['login42']  , image : req.user['user']['image'], email : req.user['user']['email']};
    //file save
    if (file && file.filename) {
      const { createReadStream, filename } = await file;

      const destinationFolder = path.join(__dirname, `../../../../client/dist/public/uploads/${req.user['user']['login42']}`);
      const filePath = path.join(destinationFolder, filename);
      const oldPath = req.user['user']['image'];
      if (!existsSync(destinationFolder)) {
        mkdirSync(destinationFolder, { recursive: true });
      }

      await new Promise<void>((resolve, reject) =>
        createReadStream()
          .pipe(createWriteStream(filePath))
          .on('finish', resolve)
          .on('error', reject)
      );
      if (path.join(__dirname, `../../../../client/dist/${req.user['user']['image']}`)) {
        unlinkSync(path.join(__dirname, `../../../../client/dist/${req.user['user']['image']}`));
      }
  
      user_data.image = `public/uploads/${req.user['user']['login42']}/${filename}`;
    }
    //update user
    try
    {
      const updatedUser = await this.userService.updateUser({
        where: { email: req.user['user']['email'] },
        data: user_data,
      });
      let test = await this.authService.login(updatedUser); //generate a token with the user data for the cookie
      res.cookie("auth-cookie", test, { httpOnly : true, domain: 'localhost', path: '/'}); //set hhtp only cookie

      pubSub.publish('userUpdated', { userUpdated: updatedUser});
      return updatedUser;
    }
    catch (e)
    {
      console.log(e);
      return (e)
    };
  }


  @Query(() => [User])
	async users(): Promise<user[]> {
  return this.userService.getUsers({
    take: 5,
    orderBy: {
      login: Prisma.SortOrder.asc,
    },
  });
}

  @Mutation(() => [User])
  async SearchUsers(@Args('login', { type: () => String }) login: string) : Promise<user[]> {
    return this.userService.search(login);
  }
}