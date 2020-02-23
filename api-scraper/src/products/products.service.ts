import {
  BadRequestException,
  Get,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Param,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ResponseHelper } from './response/response.helper';
import { ScraperRequest } from './response/scraperRequest';
import { RedisClient } from '@nestjs/microservices/external/redis.interface';
import { RedisService } from 'nestjs-redis';
import { classToPlain, deserialize, plainToClass, serialize } from 'class-transformer';
import { from, Observable, of, throwError } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Product } from './product/product';
import { validator } from '../shared/utils/shared.utils';

@Injectable()
export class ProductsService {
  constructor(@Inject('ScraperProxyFactory') private readonly scraperClient: ClientProxy,
              private readonly redisClient: RedisService,
              private responseHelper: ResponseHelper) {

  }


  scrapeResponse(idRequest: string) {

    const response: any = this.redisClient.getClient().get(idRequest) || null;
    return from(response).pipe(map((response$: any) => {

      if (response$ == null) {
        throw new NotFoundException(`IdRequest [${idRequest}] not found`);
      }
      let response$$: any = deserialize(Product, response$);
      if (!validator.isEmpty(response$$?.idRequest)) {
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


  scrapeSearchWordAsync(searchWord: string) {
    const pattern = { cmd: 'searchword-responses' };
    const generateRequest: ScraperRequest = this.responseHelper.generateResponse('searchword-responses', searchWord);
    return from(this.redisClient.getClient().exists(generateRequest.idRequest)).pipe(
      mergeMap((exist: any) => {
        if (exist) {
          return this.scrapeResponse(generateRequest.idRequest);
        }
        this.send(pattern, generateRequest);
        return of(generateRequest);
      }),
    );
  }


  scrapeByAsin(asin: string) {
    const pattern = { cmd: 'asin-responses' };
    const generateRequest: ScraperRequest = this.responseHelper.generateResponse('asin-responses', asin);
    return from(this.redisClient.getClient().exists(generateRequest.idRequest)).pipe(
      mergeMap((exist: any) => {
        if (exist) {
          return this.scrapeResponse(generateRequest.idRequest);
        }
        this.send(pattern, generateRequest);
        return of(generateRequest);
      }),
    );


  }

  private send(pattern: any, generateResponse: ScraperRequest) {
    this.redisClient.getClient().set(generateResponse.getIdRequest(), serialize(generateResponse), 'EX', 60 * 10);

    this.scraperClient.send(pattern, generateResponse).pipe(
      map((data: any) => {

        if (data.status === HttpStatus.BAD_REQUEST) {
         throw new NotFoundException(data.response);
        }
        return data;
      }),
    ).subscribe((data) => {
      this.redisClient.getClient().set(generateResponse.getIdRequest(), serialize(data), 'EX', 60 * 60 * 24);
    }, error => {
      this.redisClient.getClient().set(generateResponse.getIdRequest(), serialize(error), 'EX', 60 * 5);

    });

  }


}
