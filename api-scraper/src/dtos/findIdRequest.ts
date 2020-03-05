import { IsNotEmpty, IsString } from 'class-validator';

export class FindIdRequest {
  @IsString()
  @IsNotEmpty()
  idRequest: string;
}
