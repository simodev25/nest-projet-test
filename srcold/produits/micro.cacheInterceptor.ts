import { CacheInterceptor, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { format } from "util";
import { Observable } from 'rxjs';
@Injectable()
export class MicroCacheInterceptor extends CacheInterceptor{

  trackBy(context: ExecutionContext): string  {
    const data = context.switchToRpc().getData();

    return data.originalUrl;

  }

}
