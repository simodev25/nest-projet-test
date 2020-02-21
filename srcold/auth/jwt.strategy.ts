import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './dto/auth.credentias.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(@InjectRepository(UserRepository) private userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'totobimo',
    });

  }

  async validate(payload: JwtPayload) {
    const { username } = payload;

    const userEntity: UserEntity = await this.userRepository.findOne({ username });

    if (!userEntity) {
      throw new UnauthorizedException('nonon','gggg');
    }

    return userEntity;
  }

}
