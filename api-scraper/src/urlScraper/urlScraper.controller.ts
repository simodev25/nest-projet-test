import { Body, Controller, Header, HttpStatus, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '../shared/cache/cache.interceptor';
import { UrlScraperService } from './urlScraper.service';
import { UrlRequestOptions } from './classes/url.request.Options';

@ApiResponse({ status: HttpStatus.OK, description: 'ok' })
@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
@Controller('/scraperurl')
export class UrlScraperController {
  constructor(private urlScraperService: UrlScraperService) {

  }

  @Post()
  @UseInterceptors(CacheInterceptor)
  @Header('Content-Type', 'application/json; charset=utf-8')
  @ApiTags('scraperurl')
  scraperUrl(@Req() req, @Body() urlRequestOptions: UrlRequestOptions) {
    return   this.urlScraperService.scraperUrl(urlRequestOptions);
  }
}
