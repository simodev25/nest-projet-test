import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { SharedModule } from './shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
const { createLogger, format, transports } = require('winston')
import { LoggingInterceptor } from './shared/logger/logging.Interceptor';
import { LoggerServiceBase } from './shared/logger/loggerService';
import { ScraperModule } from './scraper/scraper.module';
import * as path from 'path';
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

@Module({
  imports: [
    SharedModule.forRoot(),


    TypeOrmModule.forRoot(typeOrmConfig),
    TasksModule,
    ScraperModule],
  providers: [LoggerServiceBase, ],

})
export class AppModule {

}
