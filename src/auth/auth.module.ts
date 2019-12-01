import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategyService } from './local.strategy';
import { RolesGuardService } from './rolesguard';

@Module({

  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: 'totobimo',
      signOptions: {
        expiresIn: 3600,
      },
    })
    ,
    TypeOrmModule.forFeature([UserRepository])],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategyService, RolesGuardService],
  exports: [JwtStrategy, LocalStrategyService, RolesGuardService, PassportModule],
})
export class AuthModule {
}
