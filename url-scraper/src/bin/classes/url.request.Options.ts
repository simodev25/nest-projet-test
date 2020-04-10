import { RequesterType } from '../enums/requesterType';
import { ScrapeOptions } from 'scrape-it';

export class UrlRequestOptions {
  url: string;
  requesterType: RequesterType;
  scrapeOptions: ScrapeOptions;

  constructor(url, requesterType: RequesterType) {
    this.url = url;
    this.requesterType = requesterType;
  }


}
