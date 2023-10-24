import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context);
      const { req, res } = ctx.getContext();
      try {
        const token = req.cookies['auth-cookie']['accessToken'];
        const payload = await this.jwtService.verifyAsync(
          token,
          {
            secret: process.env.JWT_SECRET
          }
        );
        req['user'] = payload;
      } catch {
        throw new UnauthorizedException();
      }
      return true;
    }
  
    // private extractTokenFromHeader(request: Request): string | undefined {
    //   const [type, token] = request.headers.authorization?.split(' ') ?? [];
    //   return type === 'Bearer' ? token : undefined;
    // }
  }