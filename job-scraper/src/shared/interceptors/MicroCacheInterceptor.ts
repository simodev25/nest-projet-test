import { CacheInterceptor, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class MicroCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    console.log('MicroCacheInterceptor',context.switchToRpc().getData().idRequest)
    return context.switchToRpc().getData().idRequest;
  }
}
