import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
require('dotenv').config();

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  createToken(payload: any) {
    try {
      return this.jwtService.sign(payload);
    } catch (error) {
      throw new HttpException("Can't create token", HttpStatus.UNAUTHORIZED);
    }
  }
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new HttpException('Verification Token has expired or is invalid', HttpStatus.UNAUTHORIZED);
    }
  }

  verifyTokenFromSocket(token: string) {
    try {
      return this.jwtService.verify(token, { secret: `${process.env.PRIVATE_KEY.replace(/\\\\n/gm, '\\n')}` });
    } catch (error) {
      throw new HttpException('Cant verify token', HttpStatus.UNAUTHORIZED);
    }
  }
}
