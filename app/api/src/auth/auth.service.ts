import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context } from '@nestjs/graphql';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { user } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  async validateUser(
    email: string
  ): Promise<user> {

    const user = await this.usersService.user({email});
    if (user == null) {
      return null;
    }
    return <User> user;
  }

  async login(user: user) {
    const payload = { user };
    return {accessToken: this.jwtService.sign(payload, {secret: this.config.get("JWT_SECRET")})};
  }

  async getToken(user: User) {
    return this.jwtService.sign(user);
  }

  async getEmail(access_token: string) {
    return this.jwtService.verify(access_token, {secret: this.config.get("JWT_SECRET")});
  }
}