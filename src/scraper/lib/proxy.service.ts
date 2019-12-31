import { from, of, Subject } from 'rxjs';
import { catchError, filter, map, mergeMap, retryWhen, tap } from 'rxjs/operators';
import { isNil, validator } from '../../shared/utils/shared.utils';
import { Exception } from '../../shared/Exception/exception';
import { ScraperHelper } from '../ScraperHelper';
import * as scrapeIt from './scraperAmazone.service';
import { RxjsUtils } from '../../shared/utils/rxjs-utils';
import { HttpService, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import * as lineReader from 'line-reader';
import { ConfigService } from '@nestjs/config';
import { NetworkService } from '../../shared/request/network.service';

@Injectable()
export class ProxyService {
  private PROXY_LIST = ['127.0.0.1:8118'];

  constructor(private readonly httpService: NetworkService, private readonly scraperHelper: ScraperHelper,
              private readonly configService: ConfigService) {

  }

  public proxyChecker() {
    const link = 'https://api.ipify.org';
    fs.writeFile('./src/config/proxy.txt', '', function() {
      console.log('proxyChecker start ...');
    });

    const source = new Subject();
    const isActive = this.configService.get('PROXY_CHECKER');


    lineReader.eachLine('./src/config/proxy.checker.txt', (line, last) => {

      if (isActive === 'true') {
        source.next(line);
        if (last) {
          source.complete();
        }
      } else {
        source.next(this.configService.get('DEFAULT_PROXY'));
        source.complete();
      }
    });

    const result$ = source.pipe(
      mergeMap((x: string) => {
        const requestConfig: AxiosRequestConfig = this.scraperHelper.requestConfig(x);
        return this.httpService.getTor(link, requestConfig).pipe(
          filter((res) => {
console.log(res)
            if (isNil(res) ) {

              return false;
            } else {

              return true;
            }
            return true;
          }),
          catchError(err =>  of('ko')),
          tap((res) => {

            if (res !== 'ko') {

              fs.appendFile('./src/config/proxy.txt', `${x}\n`, function(err) {
                if (err) {
                   console.log(err);
                }

        //        console.log('IP saved!');

              });
            } else {
              //  console.log('IP No saved!');
            }

          }),
        );
      }),
    );

    return result$;
  }
}
