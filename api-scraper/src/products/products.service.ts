import { Get, Inject, Injectable, Param, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ResponseHelper } from './response/response.helper';
import { ScraperRequest } from './response/scraperRequest';
import { RedisClient } from '@nestjs/microservices/external/redis.interface';
import { RedisService } from 'nestjs-redis';
import { classToPlain, deserialize, plainToClass, serialize } from 'class-transformer';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from './product/product';
import { validator } from '../shared/utils/shared.utils';

@Injectable()
export class ProductsService {
  constructor(@Inject('ScraperProxyFactory') private readonly scraperClient: ClientProxy,
              private readonly redisClient: RedisService,
              private responseHelper: ResponseHelper) {

  }


  scrapeResponse(idRequest: string) {

    const response: any = this.redisClient.getClient().get(idRequest);
    return from(response).pipe(map((response$: any) => {

      let response$$: any = deserialize(Product, response$);
      if (!validator.isEmpty(response$$.idRequest)) {
        response$$ = deserialize(ScraperRequest, response$);
        response$$.initRequestAt();
      }
      return response$$;
    }));
  }


  scrapeSearchWordLite(searchWord: string) {
    const pattern = { cmd: 'scrapeSearchWordLite' };
    return this.scraperClient.send(pattern, searchWord);

  }


  scrapeSearchWordAsync(searchWord: string): ScraperRequest {
    const pattern = { cmd: 'scrapeSearchWordAsync' };
    const generateRequest: ScraperRequest = this.responseHelper.generateResponse('scrapeSearchWordAsync', searchWord);
    this.send(pattern, generateRequest);
    return generateRequest;
  }


  scrapeByAsin(asin: string): ScraperRequest {
    const pattern = { cmd: 'scrapeByAsin' };

    const generateRequest: ScraperRequest = this.responseHelper.generateResponse('scrapeByAsin', asin);
    this.send(pattern, generateRequest);
    return generateRequest;

  }

  private send(pattern: any, generateResponse: ScraperRequest) {
    this.redisClient.getClient().set(generateResponse.getIdRequest(), serialize(generateResponse));

    this.scraperClient.send(pattern, generateResponse).subscribe((data) => {
      this.redisClient.getClient().set(generateResponse.getIdRequest(), serialize(data), 'EX', 60 * 30);
    }, error => {
      this.redisClient.getClient().set(generateResponse.getIdRequest(), serialize({ error }));

    });

  }


}
