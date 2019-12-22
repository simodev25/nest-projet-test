import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { AuthModule } from '../auth/auth.module';
import { TaskGuardService } from './taskguardservice';
import { UserController } from './user.controller';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

import { ScheduleModule } from 'nest-schedule';
import { RequestContextMiddleware } from '../shared/request/requestContextMiddleware';
import { EverythingSubscriber } from './EverythingSubscriber';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [AuthModule, SharedModule.forRoot(),
    ScheduleModule,

    TypeOrmModule.forFeature([TaskRepository]),
  ],
  controllers: [TasksController, UserController],
  providers: [
    TasksService, EverythingSubscriber, TaskGuardService,

    {
      provide: 'ClientProxyFactory',
      useFactory: () => {

        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: {
            url: 'redis://127.0.0.1:6379',
          },
        });
      },
    },
  ],

  // exports : [HeadersService]
})
export class TasksModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
