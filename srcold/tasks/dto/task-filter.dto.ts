import { TaskStatus } from '../tasks.modal';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class TaskFilterDTO {

  @IsOptional()
  @IsIn([TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE])
  taskStatus: TaskStatus;

  @IsOptional()
  @IsNotEmpty()
  filter: string;

}
