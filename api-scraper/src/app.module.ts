import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { MerchantwordsModule } from './merchantwords/merchantwords.module';

@Module({
  imports: [ProductsModule, MerchantwordsModule],
  controllers: [],
  providers: [],
})
export class AppModule {
}
