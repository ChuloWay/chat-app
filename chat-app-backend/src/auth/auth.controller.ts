import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Next, Req, Res, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-auth.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async registerUser(@Res() res, @Body() body: CreateUserDto, @Next() next) {
    try {
      const user = await this.authService.createUser(body);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        data: user,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  }

  @Post('login')
  async login(@Res() res, @Body() body: LoginUserDTO, @Next() next) {
    try {
      const user = await this.authService.login(body);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: user,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}
