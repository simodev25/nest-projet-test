import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TaskEntity } from '../tasks/task.entity';

@Entity()
export class UserEntity extends BaseEntity {

  @PrimaryGeneratedColumn() id: string;

  @Column() username: string;
  @Column() password: string;
  @Column() userType: string;
  @OneToMany(type => TaskEntity, task => task.user, {
    eager: false,
  })
  tasks: TaskEntity[];

  isSupperUser(): boolean {

    return this.userType === 'admin';

  }

}
