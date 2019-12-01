import { IsNotEmpty } from 'class-validator';

export class CreateTaskDto {

  @IsNotEmpty({ message: 'title pas vide' })
  title: string;

  @IsNotEmpty()
  description: string;

}


