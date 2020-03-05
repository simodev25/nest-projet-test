import { HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ResponseHelper } from './response/response.helper';
import { ScraperRequest } from './response/scraperRequest';

import { deserialize, serialize } from 'class-transformer';
import { from, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Product } from './product/product';
import { validator } from '../shared/utils/shared.utils';
import { ClusterRedisService } from '../shared/services/cluster.redis.service';


@Injectable()
export class ProductsService {

  redis: any = [];

  constructor(@Inject('ScraperProxyFactory') private readonly scraperClient: ClientProxy,
              private readonly redisClient: ClusterRedisService,
              private responseHelper: ResponseHelper) {


  }


  scrapeResponse(idRequest: string) {


    return from(this.redisClient.getCluster().get(idRequest)).pipe(map((response$: any) => {
      console.log(response$);
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
    return from(this.redisClient.getCluster().get(generateRequest.idRequest)).pipe(
      mergeMap((exist: any) => {
        if (validator.isNotEmpty(exist)) {
          return this.scrapeResponse(generateRequest.idRequest);
        }
        this.send(pattern, generateRequest);
        return of(generateRequest);
      }),
    );
  }


  scrapeByAsin(asin: string) {
    const pattern = { cmd: 'asin-responses' };
    this.redisClient.getCluster();
    const generateRequest: ScraperRequest = this.responseHelper.generateResponse('asin-responses', asin);
    return from(this.redisClient.getCluster().get(generateRequest.idRequest)).pipe(
      mergeMap((exist: any) => {
        if (validator.isNotEmpty(exist)) {
          return this.scrapeResponse(generateRequest.idRequest);
        }
        this.send(pattern, generateRequest);
        return of(generateRequest);
      }),
    );


  }

  private send(pattern: any, generateResponse: ScraperRequest) {
    this.redisClient.getCluster().set(generateResponse.getIdRequest(), serialize(generateResponse), 'EX', 60 * 10);

    this.scraperClient.send(pattern, generateResponse).pipe(
      map((data: any) => {

        if (data.status === HttpStatus.BAD_REQUEST) {
          throw new NotFoundException(data.response);
        }
        return data;
      }),
    ).subscribe((data) => {
      this.redisClient.getCluster().set(generateResponse.getIdRequest(), serialize(data), 'EX', 60 * 60 * 24);
    }, error => {
      this.redisClient.getCluster().set(generateResponse.getIdRequest(), serialize(error), 'EX', 60 * 5);

    });

  }


}
