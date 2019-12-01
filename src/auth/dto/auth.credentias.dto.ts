import { IsNotEmpty, IsOptional } from 'class-validator';

export class AuthCredentiasDto {

  @IsNotEmpty() username: string;
  @IsNotEmpty() password: string;
  @IsOptional()  @IsNotEmpty() userType: string;
}

export interface JwtPayload {
  username: string;
  userType: string;
}
