import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';

import { AuthCredentiasDto } from './dto/auth.credentias.dto';

import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {
    console.log('AuthController');
  }

  @Post('/signup')
  signup(@Body()authCredentiasDto: AuthCredentiasDto) {
    this.authService.signup(authCredentiasDto);
  }

  @Post('/signin')
  signin(@Body() authCredentiasDto: AuthCredentiasDto) {
    return this.authService.signin(authCredentiasDto);
  }

  @Get('/test')
  @UseGuards(AuthGuard())
  test(@Req() req , @GetUser() user) {
   return user;
  }

}
