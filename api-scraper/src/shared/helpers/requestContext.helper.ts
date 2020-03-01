import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { RequestContext } from '../middlewares/requestContext';
import * as cls from 'cls-hooked';
export class RequestContextHelper {
  public static currentRequestContext(): RequestContext {
    const session = cls.getNamespace(RequestContext.nsid);
    if (session && session.active) {
      return session.get(RequestContext.name);
    }

    return null;
  }

  public static currentRequest(): IncomingMessage {
    const requestContext = RequestContextHelper.currentRequestContext();

    if (requestContext) {
      return requestContext.request;
    }

    return null;
  }

  public static headers(): IncomingHttpHeaders {
    const requestContext = RequestContextHelper.currentRequestContext();

    if (requestContext) {
      return requestContext.request.headers;
    }

    return null;
  }

  public static user(): any {
    const requestContext = RequestContextHelper.currentRequestContext();

    if (requestContext) {
      return requestContext.request['user'];
    }

    return null;
  }

}
