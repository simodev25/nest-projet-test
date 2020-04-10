import { HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ResponseHelper } from './response/response.helper';


import { deserialize, serialize } from 'class-transformer';
import { from, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Product } from './product/product';
import { ApiValidator } from '../shared/utils/shared.utils';
import { ClusterRedisService } from '../shared/services/cluster.redis.service';

import { ApiResponseDto } from './response/api.response.dto';
import { ApiRequestDto } from './response/api.request.dto';
import { StatusResponse } from '../shared/enums/statusResponse';
import { ApiRequestException } from '../shared/Exception/api.request.exception';


@Injectable()
export class ProductsService {

  redis: any = [];

  constructor(@Inject('ScraperProxyFactory') private readonly scraperClient: ClientProxy,
              private readonly redisClient: ClusterRedisService,
              private responseHelper: ResponseHelper) {


  }


  scrapeResponseByRequest(idRequest: string) {


    return from(this.redisClient.getClient().get(idRequest)).pipe(map((response$: any) => {

      if (response$ == null) {
        throw new NotFoundException(`IdRequest [${idRequest}] not found`);
      }
      let response$$: any = deserialize(Product, response$);
      if (!ApiValidator.isEmpty(response$$?.idRequest)) {
        response$$ = deserialize(ApiRequestDto, response$);
        response$$.initRequestAt();
      }
      return response$$;
    }),
      map((products: Product[] | ApiRequestDto) => {
        const apiResponse: ApiResponseDto = new ApiResponseDto(products);
        if (apiResponse.status === StatusResponse.FAILED) {
          throw new ApiRequestException(apiResponse, HttpStatus.NOT_FOUND);
        }
        return apiResponse;

      }),

    );
  }

  private scrapeResponse(idRequest: string) {


    return from(this.redisClient.getClient().get(idRequest)).pipe(map((response$: any) => {

        if (response$ == null) {
          throw new NotFoundException(`IdRequest [${idRequest}] not found`);
        }
        let response$$: any = deserialize(Product, response$);
        if (!ApiValidator.isEmpty(response$$?.idRequest)) {
          response$$ = deserialize(ApiRequestDto, response$);
          response$$.initRequestAt();
        }
        return response$$;
      })
    );
  }


  scrapeSearchWordLite(searchWord: string) {
    const pattern = { cmd: 'scrapeSearchWordLite' };

    return this.scraperClient.send(pattern, searchWord);

  }
  scrapeCategorys() {
    const pattern = { cmd: 'categorys-salesOffers-responses' };
    return this.scraperClient.send(pattern, {});

  }

  scrapeSearchWordAsync(searchWord: string) {
    const pattern = { cmd: 'searchword-responses' };
    const generateRequest: ApiRequestDto = this.responseHelper.generateResponse('searchword-responses', searchWord);
    return from(this.redisClient.getClient().get(generateRequest.idRequest)).pipe(
      mergeMap((exist: any) => {
        if (ApiValidator.isNotEmpty(exist)) {
          return this.scrapeResponse(generateRequest.idRequest);
        }
        this.send(pattern, generateRequest);
        return of(generateRequest);
      }),
      map((products: Product[] | ApiRequestDto) => {
        const apiResponse: ApiResponseDto = new ApiResponseDto(products);
        if (apiResponse.status === StatusResponse.FAILED) {
          throw new ApiRequestException(apiResponse, HttpStatus.NOT_FOUND);
        }
        return apiResponse;

      }),
    );
  }


  scrapeByAsin(asin: string): Observable<ApiResponseDto> {
    const pattern = { cmd: 'asin-responses' };

    const generateRequest: ApiRequestDto = this.responseHelper.generateResponse('asin-responses', asin);
    return from(this.redisClient.getClient().get(generateRequest.idRequest)).pipe(
      mergeMap((exist: any) => {
        if (ApiValidator.isNotEmpty(exist)) {
          return this.scrapeResponse(generateRequest.idRequest);
        }
        this.send(pattern, generateRequest);
        return of(generateRequest);
      }),
      map((products: Product[] | ApiRequestDto) => {
        const apiResponse: ApiResponseDto = new ApiResponseDto(products);
        if (apiResponse.status === StatusResponse.FAILED) {
          throw new ApiRequestException(apiResponse, HttpStatus.NOT_FOUND);
        }
        return apiResponse;

      }),
    );


  }

  scrapeByCategory(category: string): Observable<ApiResponseDto> {
    const pattern = { cmd: 'category-responses' };

    const generateRequest: ApiRequestDto = this.responseHelper.generateResponse('category-responses', category);
    return from(this.redisClient.getClient().get(generateRequest.idRequest)).pipe(
      mergeMap((exist: any) => {
        if (ApiValidator.isNotEmpty(exist)) {
          return this.scrapeResponse(generateRequest.idRequest);
        }
        this.send(pattern, generateRequest);
        return of(generateRequest);
      }),
      map((products: Product[] | ApiRequestDto) => {
        const apiResponse: ApiResponseDto = new ApiResponseDto(products);
        if (apiResponse.status === StatusResponse.FAILED) {
          throw new ApiRequestException(apiResponse, HttpStatus.NOT_FOUND);
        }
        return apiResponse;

      }),
    );


  }

  private send(pattern: any, generateResponse: ApiRequestDto) {
    this.redisClient.getClient().set(generateResponse.idRequest, serialize(generateResponse), 'EX', 60 * 10);

    this.scraperClient.send(pattern, generateResponse).pipe(
      map((data: any) => {

        if (data[0]?.status === HttpStatus.BAD_REQUEST || data[0]?.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(data[0].response.message);
        }
        return data;
      }),
    ).subscribe((data) => {
      this.redisClient.getClient().set(generateResponse.idRequest, serialize(data), 'EX', 60 * 60 * 24);
    }, error => {

      this.redisClient.getClient().set(generateResponse.idRequest, serialize(error.message), 'EX', 60 * 5);

    });

  }


}
