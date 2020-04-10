import { RequesterModule } from '../enums/requester.module';
import { ScrapeOptions } from 'scrape-it';

export class UrlRequestOptions {
  url: string;
  requesterModule: RequesterModule;
  scrapeOptions: ScrapeOptions;

  constructor(url, requesterModule: RequesterModule) {
    this.url = url;
    this.requesterModule = requesterModule;
  }


}
