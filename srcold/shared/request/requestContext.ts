import { createNamespace, getNamespace } from 'node-request-context';
import * as uuid from 'uuid';
import { UserEntity } from '../../auth/user.entity';
import { IncomingHttpHeaders, IncomingMessage } from 'http';
import * as cls from 'cls-hooked';
import { TaskEntity } from '../../tasks/task.entity';
export class RequestContext {

  public static nsid = 'some_random_guid';
  public readonly id: Number;
  public request: IncomingMessage;
  public response: Response;

  constructor(request: IncomingMessage, response: Response) {
    this.id = Math.random();
    this.request = request;
    this.response = response;
  }

  public static currentRequestContext(): RequestContext {
    const session = cls.getNamespace(RequestContext.nsid);
    if (session && session.active) {
      return session.get(RequestContext.name);
    }

    return null;
  }

  public static currentRequest(): IncomingMessage {
    let requestContext = RequestContext.currentRequestContext();

    if (requestContext) {
      return requestContext.request;
    }

    return null;
  }

  public static headers(): IncomingHttpHeaders {
    let requestContext = RequestContext.currentRequestContext();

    if (requestContext) {
      return requestContext.request.headers;
    }

    return null;
  }

  public static user(): any {
    let requestContext = RequestContext.currentRequestContext();

    if (requestContext) {
      return requestContext.request['user'];
    }

    return null;
  }

}
