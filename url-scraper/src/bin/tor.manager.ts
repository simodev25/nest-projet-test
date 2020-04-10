import { Injectable } from '@nestjs/common';
import { IRequest } from './i.request';
import { ScraperHelper } from './ScraperHelper';
import { UrlRequestOptions } from './classes/url.request.Options';
import { Observable } from 'rxjs';
import * as request from './request.manager';
import { validatorUrlScraper } from './shared.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TorManager implements IRequest {
  private tr = require('tor-request');
  constructor(private scraperHelper: ScraperHelper,
              private readonly configService: ConfigService) {

  }

  run(urlRequestOptions: UrlRequestOptions): Observable<any> {
    const torRequest$ = new Observable<any>(subscriber => {
      const option = {
        url: urlRequestOptions.url,
        header: this.scraperHelper.requestConfig(),
        gzip: true,
        secureProtocol: 'TLSv1_2_method',
        tunnel: false,
        time: true,
        followAllRedirects: true,
      };

      this.tr.setTorAddress(this.configService.get('TOR_HOST'), this.configService.get('TOR_PORT'));
      this.tr.request(option, (err, res) => {

        if (validatorUrlScraper.isNotEmptyObject(res)) {

          subscriber.next(res.body);
          subscriber.complete();
        } else {
          subscriber.error(err);
        }

      });

    });

    return torRequest$;
  }

}
