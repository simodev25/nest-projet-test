import { AfterInsert, BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from './tasks.modal';
import { CreateTaskDto } from './dto/createTask.dto';
import { UserEntity } from '../auth/user.entity';
import { CacheManager } from '../shared/cacheManager';
import { TasksService } from './tasks.service';


@Entity()
export class TaskEntity extends BaseEntity {

  constructor(createTaskDto: CreateTaskDto) {
    super();
    if (createTaskDto) {
      this.title = createTaskDto.title;
      this.description = createTaskDto.description;
      this.status = TaskStatus.OPEN;
    }

  }


  @PrimaryGeneratedColumn() id: number;
  @Column() title: string;
  @Column() description: string;
  @Column() status: TaskStatus;
  @ManyToOne(type => UserEntity, user => user.tasks, {
    eager: false,
  })
  user: UserEntity;


  public test() {

    const test= TasksService.getAllTasks_(this.title);
  }



}
