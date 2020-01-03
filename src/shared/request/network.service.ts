import { HttpService, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import { Observable, Subject, throwError, timer } from 'rxjs';
import { getRandomInt, isNil } from '../utils/shared.utils';
import { filter, map, mergeMap, retryWhen, tap } from 'rxjs/operators';
import { Exception } from '../Exception/exception';
import { ScraperHelper } from '../../scraper/ScraperHelper';

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
export class NetworkService  {
  private renewTorSessionTimeout = 1000 * 30;// 30 second timeout on session renew
  private torProxy: Map<string, IProxy> = new Map<string, IProxy>();
  private torSession$: Subject<IProxy> = new Subject<IProxy>();
  private tr = require('tor-request');

  constructor() {
    this.tr.TorControlPort.password = 'PASSWORD';
    this.tr.TorControlPort.port = '9051';

    this.initProxys();

    this.torSession$.pipe(
      filter((proxy: IProxy) => {
        const now = Date.now();
        const delta = now - proxy.dateInit;
        return delta > this.renewTorSessionTimeout && proxy.renewSession === StatusRenew.STOP;
      }),
      map((proxy: IProxy) => {
        console.log(`renewTorSession *****************************************`);
        console.log('this.proxy', proxy);
        this.tr.TorControlPort.host = proxy.host;
        proxy.renewSession = StatusRenew.EN_COUR;
        this.tr.renewTorSession((err, success) => {
          if (err) {
            proxy.renewSession = StatusRenew.STOP;
            console.log(`renewTorSession  END error  *****************************************`);
            throw new Exception('renewTorSession : error', ScraperHelper.EXIT_CODES.ERROR_PROXY);
          }
          proxy.countError = 0;
          proxy.timedOut = false;
          proxy.dateInit = Date.now();
          proxy.renewSession = StatusRenew.STOP;
          console.log(`renewTorSession  END   *****************************************`);

        });
      }),
    ).subscribe();
  }

  public getTor(url: string, config?: AxiosRequestConfig, renewTorSession: boolean = false): Observable<string> {
    const proxy = this.getProxy();
    console.log(this.torProxy.values());
    const torRequest = new Observable<string>(subscriber => {

      const option = {
        url,
        header: config.headers,
        gzip: true,
        secureProtocol: 'TLSv1_2_method',
        tunnel: false,
        followRedirect: false,
      };

      if (isNil(proxy)) {
        throw new Exception('request to :', ScraperHelper.EXIT_CODES.ERROR_PROXY_EMPTY);
      }
      this.tr.setTorAddress(proxy.host, '9050');
      proxy.countRequest++;
      this.tr.request(option, (err, res) => {
        if (!isNil(res)) {
          subscriber.next(res.body);

          subscriber.complete();
        } else {
          proxy.countError++;
          subscriber.error(err);
          //  subscriber.complete();
        }

      });
    });
    return torRequest.pipe(
      tap(res => {
        if (ScraperHelper.isCaptcha(res)) {
          this.torSession$.next(proxy);
          throw new Exception('NetworkService : error will be picked up by retryWhen [isCaptcha]', ScraperHelper.EXIT_CODES.ERROR_CAPTCHA);
        }
        return res;
      }),
      retryWhen(this.scrapeRetryStrategy({
        maxRetryAttempts: 6,
        scalingDuration: this.renewTorSessionTimeout,
        proxy,
      })),
    );

  }

  private scrapeRetryStrategy = (
    {
      maxRetryAttempts = 10,
      scalingDuration = 3000,
      excludedStatusCodes = [],
      proxy,
    }: {
      maxRetryAttempts?: number;
      scalingDuration?: number;
      excludedStatusCodes?: number[];
      proxy?: IProxy;
    } = {},
  ) => (attempts: Observable<any>) => {
    return attempts.pipe(
      mergeMap((error: any, i) => {
        const retryAttempt = i + 1;
        if (error instanceof Exception) {
          // if maximum number of retries have been met
          // or response is a status code we don't wish to retry, throw error
          if (retryAttempt > maxRetryAttempts) {
            return throwError(error);
          }

          console.log(`scrapeRetryStrategy[error CODE : ${error.getStatus()}]:Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`);
          // retry after 1s, 2s, etc...
        } else {
          if (!isNil(error.options) && !isNil(error.options.command)) {
            //  console.log('*************************************');
            // console.log('this.proxy', this.proxy);
            // console.log('scrapeRetryStrategy: Proxy connection timed out ', error);
            proxy.timedOut = true;
            error.code = ScraperHelper.EXIT_CODES.ERROR_PROXY;
            //    console.log('*************************************');
          } else if (!isNil(error.code) && error.code === 'ECONNRESET') {
            //  console.log('*************************************');
            //   console.log('this.proxy', this.proxy);
            //  console.log('scrapeRetryStrategy:socket hang up', error);

            //  console.log('*************************************');
          } else {
            //  console.log('*************************************');
            //   console.log('this.proxy', this.proxy);
            //   console.log('scrapeRetryStrategy:', error);
            //  console.log('*************************************');
          }
          if (retryAttempt > maxRetryAttempts) {
            return throwError(error);
          }

          console.log(`scrapeRetryStrategy[error CODE : ${error.code}]:Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`);
        }

        return timer(maxRetryAttempts * scalingDuration);
      }),
    );
  };

  private initProxys() {
    const now = Date.now();
    for (let i = 1; i <= 10; i++) {
      this.torProxy.set(`torproxy${i}`, { countRequest: 0, countError: 0, host: `torproxy${i}`, dateInit: now, renewSession: StatusRenew.STOP });
    }


  }

  private getProxy(): IProxy {
    const index = getRandomInt(this.torProxy.size);
    const proxy: string[] = [];
    for (const nextProxy of this.torProxy.values()) {
      if (nextProxy.timedOut) {
        this.torSession$.next(nextProxy);
      } else {
        proxy.push(nextProxy.host);
      }

    }
    return this.torProxy.get(proxy[index]);

  }

}
