import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthCredentiasDto } from './dto/auth.credentias.dto';
import { UserEntity } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { GetUser } from './get-user';

@Injectable()
export class AuthService {

  constructor(@InjectRepository(UserRepository) private userRepository: UserRepository,
              private jwtService: JwtService) {

  }

  async signup(authCredentiasDto: AuthCredentiasDto): Promise<void> {

    await this.userRepository.signup(authCredentiasDto);

  }

  async signin(authCredentiasDto: AuthCredentiasDto) {
    const userEntity: UserEntity = await this.userRepository.signin(authCredentiasDto);
    if (!userEntity) {
      throw new NotFoundException('logine ou modepass err');
    }

    const { username, userType } = userEntity;
    const accesToken = this.jwtService.sign({ username, userType });
    return { accesToken };

  }

}
