import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/createTask.dto';
import { TaskFilterDTO } from './dto/task-filter.dto';
import { TaskStatusValidationPipe } from './pipes/Task-Status-Validation.Pipe';
import { GetUser } from '../auth/get-user';
import { GetTask } from './get-task';
import { TaskGuardService } from './taskguardservice';
import { ClientProxy } from '@nestjs/microservices';

import { NextFunction } from 'express';

import { LoggingInterceptor } from '../shared/logger/logging.Interceptor';
import { logMethod, logReflect } from '../shared/interceptors/use-interceptors.decorator';

@Controller('tasks')
//@UseGuards(AuthGuard('jwt'))
export class TasksController {

  constructor(private tasksService: TasksService, @Inject('ClientProxyFactory') private readonly client: ClientProxy) {
    console.log('TasksController');

  }

  @Get()
  // @UseGuards(TaskGuardService)
  //@UseInterceptors(CacheInterceptorController)
  @UseGuards(TaskGuardService)
  @logMethod(LoggingInterceptor)
  @logReflect
  getALLTask(@Query() taskFilterDTO: TaskFilterDTO) {

    if (Object.keys(taskFilterDTO).length > 0) {
      return this.tasksService.getTasksByFilter(taskFilterDTO);
    } else {
      return this.tasksService.getAllTasks();
    }

  }

  @Get('/microserviceTest')

  microserviceTest(@Req() req) {
    const pattern = { cmd: 'getProducts' };
    const store = 'store1';

    return this.client.send<any>(pattern, { store: 'store1', originalUrl: req.originalUrl });

  }

  @Get('/:id')
  @UseGuards(TaskGuardService)
  getTaskById(@Param('id', ParseIntPipe)  id: string, @GetTask() taskEntity) {
    const pattern = { cmd: 'sum' };
    const data = [1, 2, 3, 4, 5];
    return this.client.send<number>(pattern, data);
    return this.tasksService.getTaskById(id);
    // return task;
  }

  @Delete('/:id')
  deleteTaskById(@Param('id') id: string) {
    return this.tasksService.deleteTaskById(id);
  }

  @Patch('/:id/status')
  updateStatusTaskById(@Param('id') id: string, @Body('status', TaskStatusValidationPipe) status) {
    return this.tasksService.updateStatus(id, status);
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto, @GetUser() user, next: NextFunction) {

    return this.tasksService.createTask(createTaskDto, user);

  }

}
