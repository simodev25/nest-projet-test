import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cors from 'cors'
@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {

  }

  public use(request: any, res: any, next: () => void): any {
    if(this.configService.get<string>('ENABLE_COR') === 'true') {
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['X-Total-Element', 'X-Total-Page', 'X-Page-Element-Count', 'Accept-Ranges', 'Content-Range', 'Link'],
      })(request, res, next)
    } else {
      next()
    }
  }

}
