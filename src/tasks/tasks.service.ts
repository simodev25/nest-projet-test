import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './tasks.modal';
import { TaskFilterDTO } from './dto/task-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { TaskEntity } from './task.entity';
import { CreateTaskDto } from './dto/createTask.dto';
import { DeleteResult } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { ModuleRef } from '@nestjs/core';


import { ScopeService } from '../shared/scope-service.service';
import { RequestContext } from '../shared/eequestContext';
import { LoggerServiceBase } from '../shared/loggerService';
import { LoggingInterceptor } from '../shared/logging.Interceptor';
import { Logger } from '../shared/logger.decorator';
import { CacheManager } from '../shared/cacheManager';
import { UseInterceptorsBis } from '../shared/interceptors/use-interceptors.decorator';

@Injectable()

export class TasksService {

  constructor(@Logger({
                context: 'TasksContext',
                prefix: 'TasksService',
              }) private logger: LoggerServiceBase, @InjectRepository(TaskRepository) private taskRepository: TaskRepository,
              private moduleRef: ModuleRef) {
    console.log('rrr');
  }

  private tasks: Task[] = [];

  // @UseInterceptorsBis(LoggingInterceptor)
 // @UseInterceptorsBis(LoggingInterceptor)
  async getAllTasks(): Promise<TaskEntity[]> {
  this.logger.debug('getAllTasks')

    return this.taskRepository.find();
  }

  static getAllTasks(): Promise<TaskEntity[]> {
   // this.logger.debug('getAllTasks')
    return null;

   // return this.taskRepository.find();
  }
  async getTaskById(id: string): Promise<TaskEntity> {

    const task = await this.taskRepository.findOne(id, { cache: true });
    // console.log(this.moduleRef.resolve(HeaderMiddleware))
    // this.moduleRef.resolve(HeaderMiddleware).then(rrr => console.log(rrr))
    if (!task) {
      throw  new NotFoundException(`task with id ${id} not Found`, 'not Found');
    }
    return task;

  }

  getUserTaskById = async (id: string): Promise<UserEntity> => {

    const task = await this.taskRepository.findOne(id);
    // console.log(this.moduleRef.resolve(HeaderMiddleware))
    // this.moduleRef.resolve(HeaderMiddleware).then(rrr => console.log(rrr))
    if (!task) {
      throw  new NotFoundException(`task with id ${id} not Found`, 'not Found');
    }
    return task.user;

  };

  deleteTaskById = async (id: string): Promise<DeleteResult> => {
    const deleteff: DeleteResult = await this.taskRepository.delete(id);
    return deleteff;
  };

  updateStatus = async (id: string, status: TaskStatus): Promise<TaskEntity> => {
    const task = await this.taskRepository.findOne(id);
    task.status = status;
    await task.save();
    return task;
  };

  createTask(createTaskDto: CreateTaskDto, user: UserEntity): TaskEntity {
    const task: TaskEntity = new TaskEntity(createTaskDto);

    console.log('createTask', RequestContext.user());
    task.user = user;
    task.save();
    delete task.user;
    return task;

  }

  getTasksByFilter(taskFilterDTO: TaskFilterDTO): Task [] {
    /* console.log(taskFilterDTO);
     return this.getAllTasks().filter((task: Task) => {
       return task.title.includes(taskFilterDTO.filter) && task.status == taskFilterDTO.taskStatus;
     });*/
    return [];
  }

}
