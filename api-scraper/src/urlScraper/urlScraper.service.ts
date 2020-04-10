import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UrlRequestOptions } from './classes/url.request.Options';
import { RequesterType } from './enums/requesterType';


@Injectable()
export class UrlScraperService {

  constructor(@Inject('UrlScraperProxyFactory') private readonly scraperClient: ClientProxy) {

  }

  scraperUrl(urlRequestOptions: UrlRequestOptions) {
    const pattern = { cmd: 'api-url-scraper' };
console.log(urlRequestOptions);
    return this.scraperClient.send(pattern, urlRequestOptions);

  }
}
