import { HttpService, Inject, Injectable } from '@nestjs/common';
import { AXIOS_INSTANCE_TOKEN } from '@nestjs/common/http/http.constants';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const tr = require('tor-request');
import { Observable } from 'rxjs';
import { isNil } from '../utils/shared.utils';
import * as fs from 'fs';

const zlib = require('zlib');

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
}

@Injectable()
export class NetworkService extends HttpService {
  private renewTorSessionTimeout = 1000 * 30;// 30 second timeout on session renew
  private renewTorSessionTime = Date.now() - this.renewTorSessionTimeout;

  constructor() {
    super();

    tr.TorControlPort.password = 'PASSWORD';

  }

  public getTor(url: string, config?: AxiosRequestConfig, renewTorSession: boolean = false): Observable<string> {

    const torRequest = new Observable<string>(subscriber => {
      if (renewTorSession) {

        tr.renewTorSession((err, success) => {
          if (err) {
            subscriber.next(null);
            subscriber.complete();
          }
          return {
            statusCode: 200,
            message: 'success',
          };
        });
      }

      const gunzip = zlib.createUnzip();
      const buffer = [];
      const option = {
        url,
        header: config.headers,

      };

      tr.request(option, (err, res) => {
        if(!isNil(res)){

          const encoding = res.headers['content-encoding'];
          if (encoding !== 'gzip') {
            subscriber.next(res.body);
            subscriber.complete();
          }
        } else {

          subscriber.error(err);
        //  subscriber.complete();
        }

      }).pipe(gunzip);

      gunzip.on('data', (data) => {
        // decompression chunk ready, add it to the buffer
        buffer.push(data.toString());
      }).on('end', () => {
        // response and decompression complete, join the buffer and return
        subscriber.next(buffer.join(''));
        subscriber.complete();

      }).on('error', (e) => {

        subscriber.next(null);
        subscriber.complete();

      });
    });
    return torRequest;
  }

  public testTor() {

    const torRequest = new Observable<string>(subscriber => {

      const gunzip = zlib.createGunzip();
      const buffer = [];
      const option = {
        url: 'https://www.amazon.com/s?k=tablet',
        headers: {
          'accept-encoding': 'gzip',
        },

      };

      tr.request(option, (err, res) => {
      }).pipe(gunzip);

      gunzip.on('data', (data) => {
        // decompression chunk ready, add it to the buffer
        buffer.push(data.toString());

      }).on('end', () => {
        // response and decompression complete, join the buffer and return

        subscriber.next(buffer.join(''));
        subscriber.complete();

      }).on('error', (e) => {
        subscriber.error(e);

      });
    });
    torRequest.subscribe(console.log, error1 => console.log(error1), () => console.log('compplte'));

  }

  private requestNewTorSession() {
    const now = Date.now();
    const delta = now - this.renewTorSessionTime;

    this.renewTorSessionTime = now;

    tr.renewTorSession((err, success) => {
        if (err) {
          return {
            statusCode: 500,
            message: 'error - could not renew tor session',
          };
        }
        return {
          statusCode: 200,
          message: 'success',
        };
      },
    );

  }

}
