import { Injectable, NestMiddleware, Scope } from '@nestjs/common';
import { Request, Response } from 'express';
@Injectable()
export class HeaderMiddleware implements NestMiddleware {

  headers:any;
  use(req: Request, res: Response, next: Function) {
   this.headers = req.headers;

    next();
  }

  getHeader(){
   return  this.headers;
  }

}
