import { NestMiddleware } from '@nestjs/common';


import { serialize } from 'class-transformer';
import { Logger } from '../logger/logger.decorator';
import { ScraperLoggerService } from '../logger/loggerService';

export class LogsMiddleware implements NestMiddleware {

  constructor () {

  }

  use(request: any, res: any, next: Function): any {
    const now = Date.now();
    const respuesta = {
      baseUrl: request.baseUrl,
      hostname: request.hostname,
      subdomains: request.subdomains,
      ip: request.ip,
      method: request.method,
      originalUrl: request.originalUrl,
      path: request.path,
      protocol: request.protocol,
      headers: request.headers,
    };
    console.log(serialize(respuesta));
    next();
  }

}
