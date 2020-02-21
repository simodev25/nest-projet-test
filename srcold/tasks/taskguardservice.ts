import { CanActivate, ExecutionContext, Injectable, Scope } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { TasksService } from './tasks.service';
import { TaskEntity } from './task.entity';

@Injectable()
export class TaskGuardService implements CanActivate {

  constructor(private readonly reflector: Reflector, private tasksService: TasksService) {

  }

  async canActivate(
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest();
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const user = request.user;
    const taskId = request.params.id;
    const task: TaskEntity = await this.tasksService.getTaskById(taskId);
    return true;
   /* if (user.isSupperUser()) {
      return true;
    } else if (task && task.user && task.user.id === user.id) {
      delete task.user ;
      context.switchToHttp().getRequest().task = task;
      return true;
    } else {
      return false;
    }*/

  }
}
