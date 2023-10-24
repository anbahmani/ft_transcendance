import { HttpService } from '@nestjs/axios';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { Auth } from './auth.type';
import { UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/user.type';
import { MailingService } from 'src/mailing/mailing.service';
import { profileEnd } from 'console';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly mailService: MailingService) {}

  //we use context to get the request & reponse, here we need only res => defined on app.module L-28
  @Query(() => User)
  async auth(@Context() { res, req } ,
    @Args('code', { type: () => String, nullable: true }) code: string) {
      if (!code) 
        throw new UnauthorizedException();
      const axios = require('axios');

      //1st call to 42 api to get access token


      try {
      const result = await this.httpService.axiosRef
        .post('https://api.intra.42.fr/oauth/token', {
          grant_type: 'authorization_code',
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          code: code,
          redirect_uri: process.env.REDIRECT_URI,
        }).then(res => res.data);

        let token = result["access_token"];


        let reqInstance = axios.create();

      //2na call to 42 api to get user data

      const meresult = await reqInstance.get('https://api.intra.42.fr/v2/me',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      //check if the user exist if not create new one
      let newUser1 = await this.userService.user({login42 : meresult.data["login"]});

      if (!newUser1) {
        newUser1 = await this.userService.createUser({email: meresult.data["email"], first_name: meresult.data["first_name"],
                    id42: meresult.data["id"], image: meresult.data["image"]['versions']["small"], last_name: meresult.data["last_name"],
                     login42: meresult.data["login"], url : meresult.data["url"]});
      }
      if (newUser1.isVerified == true)
      {
        const updatedUser = await this.userService.updateUser({
          where: {email : newUser1.email},
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
        return (updatedUser);
      }
      let test = await this.authService.login(newUser1); //generate a token with the user data for the cookie
      res.cookie("auth-cookie", test, { httpOnly : true, domain: 'localhost', path: '/'}); //set hhtp only cookie
      return (newUser1);
    }
    catch (error) {
      console.error('Authentication or API request error:', error.response ? error.response.data : error.message);
      throw new UnauthorizedException('Authentication or API request failed');
    }
  }

  @Mutation(() => User)
  async F2aValidate(@Context() { res } ,
  @Args('code', { type: () => String, nullable: true}) code: string,
  @Args('email', { type: () => String, nullable: true}) email: string)
  {
    if (code && email)
    {
      let newUser1 = await this.userService.user({email :email});
      if (!newUser1 || newUser1.token != code)
        throw new UnauthorizedException();
      let test = await this.authService.login(newUser1); //generate a token with the user data for the cookie

      if (!newUser1.isVerified)
      {
        await this.userService.updateUser({
          where: { email: newUser1.email },
          data:  { isVerified: true },
        }).catch(() => {
          throw new UnauthorizedException('Authentication or API request failed');
        });
        newUser1.isVerified = true;
      }
      res.cookie("auth-cookie", test, { httpOnly : true, domain: 'localhost', path: '/'}); //set hhtp only cookie
      return (newUser1);
    }
    throw new UnauthorizedException();
    //    return (updatedUser);
}
    //   // if 2FA off
    //   let test = await this.authService.login(newUser1); //generate a token with the user data for the cookie
    //   res.cookie("auth-cookie", test, {maxAge : 3600, httpOnly : true}); //set hhtp only cookie
    //   return (newUser1);
    // }

  @Query(() => User)
  async getF2aValidate(@Context() { res } ,
  @Args('code', { type: () => String, nullable: true }) code: string,
  @Args('email', { type: () => String, nullable: true }) email: string)
  {
    let newUser1 = await this.userService.user({email});
    if (!newUser1 || newUser1.token != code)
      throw new UnauthorizedException();
    let test = await this.authService.login(newUser1); //generate a token with the user data for the cookie
    res.cookie("auth-cookie", test, {maxAge : 3600, httpOnly : true}); //set hhtp only cookie
    return (newUser1);
  }
}
