import { UrlRequestOptions } from './classes/url.request.Options';
import { Observable } from 'rxjs';

export interface IRequest {
  run(urlRequestOptions: UrlRequestOptions): Observable<any>;
}
