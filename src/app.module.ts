import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { SharedModule } from './shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { LoggerServiceBase } from './shared/logger/loggerService';
import { ScraperModule } from './scraper/scraper.module';



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
