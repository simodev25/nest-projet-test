import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { UrlRequestOptions } from './classes/url.request.Options';
import { IRequest } from './i.request';
import { RequestFactory } from './request.factory';
import { map } from 'rxjs/operators';

import * as scrapeIt from 'scrape-it';
import { ScrapeOptions } from 'scrape-it';

@Injectable()
export class UrlScraperService implements IRequest {

  constructor(private requestFactory: RequestFactory) {

  }

  run(urlRequestOptions: UrlRequestOptions): Observable<any> {

    return this.requestFactory.getManager(urlRequestOptions.requesterType).run(urlRequestOptions).pipe(
      map((body: string) => {
        const data: any = scrapeIt.scrapeHTML(body, urlRequestOptions.scrapeOptions);
        return data;
      }),
    );

  }


}
