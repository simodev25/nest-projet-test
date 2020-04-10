import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { UrlRequestOptions } from './bin/classes/url.request.Options';
import { deserialize } from 'class-transformer';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'url-scraper' })
  urlscrape(@Payload() urlRequestOptions: UrlRequestOptions, @Ctx() context: RmqContext): Observable<any> {
    return this.appService.urlScraper(eval('(' + urlRequestOptions + ')'));
  }

  @MessagePattern({ cmd: 'api-url-scraper' })
  apiUrlscrape(@Payload() urlRequestOptions: UrlRequestOptions, @Ctx() context: RmqContext): Observable<any> {
    return this.appService.urlScraper(urlRequestOptions);
  }
}
