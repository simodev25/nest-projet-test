import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GetUser } from './get-user';

@Injectable()
export class LocalStrategyService extends PassportStrategy(Strategy) {
  constructor() {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }
  async validate(usernameField: 'email',
                 passwordField: 'password'): Promise<any> {



  }


}
