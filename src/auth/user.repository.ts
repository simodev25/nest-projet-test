import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { AuthCredentiasDto } from './dto/auth.credentias.dto';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(UserEntity)
export class UserRepository extends Repository <UserEntity> {

  async signup(authCredentiasDto: AuthCredentiasDto): Promise<void> {

    const user: UserEntity = new UserEntity();
    user.password = authCredentiasDto.password;
    user.username = authCredentiasDto.username;
    user.userType = authCredentiasDto.userType
    await user.save();

  }

  async signin(authCredentiasDto: AuthCredentiasDto) {

    return await this.findOne({ username: authCredentiasDto.username, password: authCredentiasDto.password });


  }
}
