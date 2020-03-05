import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { MerchantwordsModule } from './merchantwords/merchantwords.module';
import { RequestContextMiddleware } from './shared/middlewares/requestContext.middleware';
import { LogsMiddleware } from './shared/middlewares/logs.middleware';

@Module({
  imports: [

    ProductsModule, MerchantwordsModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '(.*)', method: RequestMethod.ALL });

    consumer
      .apply(LogsMiddleware)
      .forRoutes({ path: '(.*)', method: RequestMethod.ALL });
  }
}
