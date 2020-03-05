import { IncomingMessage } from 'http';

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
}
