import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { format } from 'util';
import { LoggerServiceBase } from './loggerService';
import { ProduitsService } from '../../produits/produits.service';
import { ModuleRef } from '@nestjs/core';
import * as winston from 'winston';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  constructor( private log: LoggerServiceBase,private moduleRef: ModuleRef) {
console.log('LoggingInterceptor')
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const start = Date.now();

    return next.handle().pipe(tap((response) => {

      const request_ = context.getType() === 'http' ? context.switchToHttp().getRequest() :context.switchToRpc().getData();
      this.log.setContext('ProduitsMicroService')
      this.log.setPrefix(request_.method)

      this.log.setLogger((winston as any).createLogger(LoggerServiceBase.loggerOptions('ProduitsMicroService')));
      this.log.debug(format(
        '%s %s %dms %s',
        request_.method,
        request_.url,
        Date.now() - start,
        JSON.stringify(request_.body),
        JSON.stringify(request_.params),
       // JSON.stringify(response),
      ));
    }));

  }

}
