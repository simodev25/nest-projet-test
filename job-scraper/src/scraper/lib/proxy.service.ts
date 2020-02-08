import { Injectable } from '@nestjs/common';


import { Observable, Subject, throwError, timer } from 'rxjs';

import { filter, map, mergeMap, retryWhen, tap } from 'rxjs/operators';

import { ScraperHelper } from '../../scraper/ScraperHelper';
import { Exception } from '../../shared/Exception/exception';
import { getRandomInt, isNil } from '../../shared/utils/shared.utils';


import { ConfigService } from '@nestjs/config';
import { Logger } from '../../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../../shared/logger/loggerService';
const request=require('request')
enum StatusRenew {
  EN_COUR = 'EN_COUR',
  STOP = 'STOP',

}

interface IProxy {
  countRequest: number;
  countError: number;
  dateInit: number;
  host: string;
  timedOut?: boolean;
  renewSession: StatusRenew;
}

@Injectable()
export class ProxyService {
  private renewTorSessionTimeout = 100 * 10;// 30 second timeout on session renew
  private torProxy: Map<string, IProxy> = new Map<string, IProxy>();
  private torSession$: Subject<IProxy> = new Subject<IProxy>();
  private tr = require('tor-request');
  private proxyencour: IProxy;

  get proxy(): IProxy {
    return this.proxyencour;
  }

  constructor(@Logger({
                context: 'scraperMicroService',
                prefix: 'scraperService',
              }) private logger: ScraperLoggerService,
              private readonly scraperHelper: ScraperHelper,
              private readonly configService: ConfigService) {
    this.tr.TorControlPort.password = 'PASSWORD';
    this.tr.TorControlPort.port = this.configService.get('TOR_PORT_CONTROL');

    this.initProxys();

    this.torSession$.pipe(
      filter((proxy: IProxy) => {
        const now = Date.now();
        const delta = now - this.proxy.dateInit;
        return delta > this.renewTorSessionTimeout && this.proxy.renewSession === StatusRenew.STOP;
      }),
      map((proxy: IProxy) => {
        //  console.log(`renewTorSession *****************************************`);
        //  console.log('this.proxy', proxy);
        this.tr.TorControlPort.host = this.proxy.host;
        this.proxy.renewSession = StatusRenew.EN_COUR;
        this.tr.renewTorSession((err, success) => {
          if (err) {
            this.proxy.renewSession = StatusRenew.STOP;
            //    console.log(`renewTorSession  END error  *****************************************`);
            console.log(err);
            throw new Exception('renewTorSession : error', ScraperHelper.EXIT_CODES.ERROR_PROXY);
          }
          this.proxy.countError = 0;
          this.proxy.timedOut = false;
          this.proxy.dateInit = Date.now();
          this.proxy.renewSession = StatusRenew.STOP;
          console.log(`renewTorSession  END   *****************************************`);

        });
      }),
    ).subscribe();
  }

  public getTor(url: string): Observable<string> {
    const proxy = this.getProxy();
    const torRequest = new Observable<string>(subscriber => {

      const option = {
        url,
        header: this.scraperHelper.requestConfig(),
        gzip: true,
      //  secureProtocol: 'TLSv1_2_method',
        tunnel: false,
        time: true,
        followAllRedirects: true,
      };

      if (isNil(this.proxy)) {
        throw new Exception('request tor :', ScraperHelper.EXIT_CODES.ERROR_PROXY_EMPTY);
      }

      this.tr.setTorAddress(this.proxy.host, this.configService.get('TOR_PORT'));
      this.proxy.countRequest++;
      this.tr.request(option, (err, res) => {

        if (!isNil(res)) {
          subscriber.next(res.body);
          subscriber.complete();
        } else {
          this.proxy.countError++;
          subscriber.error(err);
        }

      });


    });
    return torRequest.pipe(
      tap((res: any) => {
        if (ScraperHelper.isCaptcha(res)) {
        //  this.torSession$.next(this.proxy);
          throw new Exception('NetworkService : error will be picked up by retryWhen [isCaptcha]', ScraperHelper.EXIT_CODES.ERROR_CAPTCHA);
        }
        return res;
      }),
      retryWhen(this.scrapeRetryStrategy({
        maxRetryAttempts: 10,
        scalingDuration: this.renewTorSessionTimeout,
      })),
    );

  }

  public get(url: string): Observable<string> {
    const proxy = this.getProxy();
    const torRequest = new Observable<string>(subscriber => {

      const option = {
        url,
        header: this.scraperHelper.requestConfig(),
        gzip: true,
        //  secureProtocol: 'TLSv1_2_method',
        tunnel: false,
        time: true,
        followAllRedirects: true,
      };

      if (isNil(this.proxy)) {
        throw new Exception('request tor :', ScraperHelper.EXIT_CODES.ERROR_PROXY_EMPTY);
      }

      this.tr.setTorAddress(this.proxy.host, this.configService.get('TOR_PORT'));
      this.proxy.countRequest++;
      request(option, (err, res) => {

        if (!isNil(res)) {
          subscriber.next(res.body);
          subscriber.complete();
        } else {
          this.proxy.countError++;
          subscriber.error(err);
        }

      });


    });
    return torRequest.pipe(
      tap((res: any) => {
        if (ScraperHelper.isCaptcha(res)) {
          //  this.torSession$.next(this.proxy);
          throw new Exception('NetworkService : error will be picked up by retryWhen [isCaptcha]', ScraperHelper.EXIT_CODES.ERROR_CAPTCHA);
        }
        return res;
      }),
      retryWhen(this.scrapeRetryStrategy({
        maxRetryAttempts: 10,
        scalingDuration: this.renewTorSessionTimeout,
      })),
    );

  }

  private scrapeRetryStrategy = (
    {
      maxRetryAttempts = 100,
      scalingDuration = 30000,
      excludedStatusCodes = [],

    }: {
      maxRetryAttempts?: number;
      scalingDuration?: number;
      excludedStatusCodes?: number[];
    } = {},
  ) => (attempts: Observable<any>) => {
    return attempts.pipe(
      mergeMap((error: any, i) => {

        const retryAttempt = i + 1;
        if (error instanceof Exception) {
          // if maximum number of retries have been met
          // or response is a status code we don't wish to retry, throw error
          if (error.getStatus() === ScraperHelper.EXIT_CODES.ERROR_PROXY_EMPTY) {
            this.logger.error(`scrapeRetryStrategy[error CODE : ${error.getStatus()}]:Attempt ${retryAttempt}: retrying in ${ scalingDuration}ms`);
            return timer(scalingDuration);
          }
          if (error.getStatus() === ScraperHelper.EXIT_CODES.ERROR_CAPTCHA) {
            this.logger.error(`scrapeRetryStrategy[error CODE : ${error.getStatus()}]:Attempt ${retryAttempt}: retrying in ${ scalingDuration}ms`);
            return timer(scalingDuration);
          }


          this.logger.error(`scrapeRetryStrategy[error CODE : ${error.getStatus()}]:Attempt ${retryAttempt}: retrying in ${ scalingDuration}ms`);
          // retry after 1s, 2s, etc...
        } else {
          if (!isNil(error.options) && !isNil(error.options.command)) {

            this.proxy.timedOut = true;
            error.code = ScraperHelper.EXIT_CODES.ERROR_PROXY_TIME_OUT;
            return timer(scalingDuration);

          } else if (!isNil(error.code) && error.code === 'ECONNRESET') {
            return timer( scalingDuration);
          }

          if (retryAttempt > maxRetryAttempts) {
            return throwError(error);
          }

          this.logger.error(`scrapeRetryStrategy[error CODE : ${error.code}]:Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`);
        }

        return timer( scalingDuration);
      }),
    );
  };

  private initProxys() {
    const now = Date.now();
    this.torProxy.set(this.configService.get('TOR_HOST'), {
      countRequest: 0,
      countError: 0,
      host: this.configService.get('TOR_HOST'),
      dateInit: now,
      renewSession: StatusRenew.STOP,
    });
  }

  private getProxy(): IProxy {
    const index = getRandomInt(this.torProxy.size);
    const proxy: string[] = [];
    for (const nextProxy of this.torProxy.values()) {
      /*if (nextProxy.renewSession === StatusRenew.STOP) {
        if (nextProxy.timedOut) {
          this.torSession$.next(nextProxy);
        } else {
          proxy.push(nextProxy.host);
        }
      }*/
      proxy.push(nextProxy.host);

    }
    this.proxyencour = this.torProxy.get(proxy[index]);
    return this.torProxy.get(proxy[index]);

  }

}
