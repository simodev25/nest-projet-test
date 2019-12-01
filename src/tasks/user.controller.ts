import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetTask } from './get-task';
import { TasksService } from './tasks.service';



@Controller('/tasks/:id')
export class UserController {

  constructor(private tasksService: TasksService) {
    console.log('UserController');

  }

  @Get('/user')

  getTaskUserById(@Param('id', ParseIntPipe)  id: string, @GetTask() taskEntity) {
    return this.tasksService.getUserTaskById(id);
    // return task;
  }
}
