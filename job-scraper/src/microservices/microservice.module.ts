import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ScraperModule } from '../scraper/scraper.module';
import { ProduitsController } from './produits.controller';
import { MerchantwordsController } from './merchantwords.controller';

@Module({
  imports: [SharedModule.forRoot(), ScraperModule],
  providers: [],
  controllers: [ProduitsController, MerchantwordsController],
})
export class MicroserviceModule {

}
