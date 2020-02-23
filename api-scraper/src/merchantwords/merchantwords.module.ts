import { Module } from '@nestjs/common';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';
import { MerchantwordsController } from './merchantwords.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule.forRoot(),
   ],
  controllers: [MerchantwordsController],
  providers: [],
})
export class MerchantwordsModule {

}
