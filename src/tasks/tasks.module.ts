import { CacheModule, MiddlewareConsumer, Module, RequestMethod, Scope } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ScopeService } from '../shared/scope-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { AuthModule } from '../auth/auth.module';
import { TaskGuardService } from './taskguardservice';
import { HeaderMiddleware } from './header.middleware';
import { HeadersService } from './headers.Service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserController } from './user.controller';
import { LoggingInterceptor } from '../shared/logging.Interceptor';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';

import { ScheduleModule } from 'nest-schedule';
import { RequestContextMiddleware } from '../shared/RequestContextMiddleware';
import { EverythingSubscriber } from './EverythingSubscriber';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [AuthModule, SharedModule.forRoot(),
    ScheduleModule,

    TypeOrmModule.forFeature([TaskRepository]),
  ],
  controllers: [TasksController, UserController],
  providers: [ScopeService,
    TasksService, EverythingSubscriber, TaskGuardService,

    {
      provide: 'MATH_SERVICE',
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
