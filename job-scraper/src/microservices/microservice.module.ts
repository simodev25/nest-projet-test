import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  imports: [SharedModule, ScraperModule],
  providers: [],
  controllers: [],
})
export class MicroserviceModule {

}
