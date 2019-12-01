import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../tasks.modal';

export class TaskStatusValidationPipe implements PipeTransform {

  readonly allowedStatus = [TaskStatus.OPEN, TaskStatus.DONE, TaskStatus.IN_PROGRESS];

  transform(value: any): any {
    if (this.allowedStatus.indexOf(value) === -1) {
      throw new BadRequestException(`status value ${value} is not ok`);
    }

    return value;
  }

}
