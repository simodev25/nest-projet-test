import { Injectable, NestMiddleware, Scope } from '@nestjs/common';
import { RequestContext } from './eequestContext';
import { createNamespace ,getNamespace} from 'node-request-context';
import * as cls from 'cls-hooked';

export class RequestContextMiddleware implements NestMiddleware {
  constructor() {
  }

  use(req: any, res: any, next: Function): any {

    const requestContext = new RequestContext(req, res);
    const session = cls.getNamespace(RequestContext.nsid) || cls.createNamespace(RequestContext.nsid);

    session.run(async () => {
      session.set(RequestContext.name, requestContext);
      next();
    })
  }


}
