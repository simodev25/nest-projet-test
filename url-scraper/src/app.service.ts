import { Injectable } from '@nestjs/common';
import { UrlScraperService } from './bin/url.scraper.service';
import { UrlRequestOptions } from './bin/classes/url.request.Options';

import { Observable } from 'rxjs';


@Injectable()
export class AppService {

  constructor(private urlScraperService: UrlScraperService) {

  }

  urlScraper(urlRequestOptions: UrlRequestOptions): Observable<any> {

    return this.urlScraperService.run(urlRequestOptions);
  }
}
