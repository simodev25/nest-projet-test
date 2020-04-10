import { Injectable } from '@nestjs/common';
import * as request from 'request';
import { IRequest } from './i.request';
import { UrlRequestOptions } from './classes/url.request.Options';

import { Observable, of } from 'rxjs';
import { ScraperHelper } from './ScraperHelper';
import { validatorUrlScraper } from './shared.utils';

@Injectable()
export class RequestManager implements IRequest {
  constructor(private scraperHelper: ScraperHelper) {

  }

  run(urlRequestOptions: UrlRequestOptions): Observable<any> {

    const request$ = new Observable<any>(subscriber => {
      const option = {
        url: urlRequestOptions.url,
        header: this.scraperHelper.requestConfig(),
        gzip: true,
        secureProtocol: 'TLSv1_2_method',
        tunnel: false,
        time: true,
        followAllRedirects: true,
      };


      request(option, (err, res) => {

        if (validatorUrlScraper.isNotEmptyObject(res)) {

          subscriber.next(res.body);
          subscriber.complete();
        } else {
          subscriber.error(err);
        }

      });

    });

    return request$;
  }

}
