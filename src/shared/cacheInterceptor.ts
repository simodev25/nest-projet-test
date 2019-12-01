import { CacheInterceptor, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CacheInterceptorController extends CacheInterceptor {

  trackBy(context: ExecutionContext): string  {
    const data = context.switchToHttp().getRequest();
console.log('CacheInterceptorController')
    return data.url;

  }

}
