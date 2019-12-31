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
      console.log('renewTorSession',renewTorSession)
      if (renewTorSession) {
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
        });
      }

      const gunzip = zlib.createUnzip();
      const buffer = [];
      const option = {
        url,
        strictSSL: true,
        agentClass: require('socks5-https-client/lib/Agent'),
        //  gzip: true,
        header: config.headers,
        agentOptions: {
          socksHost: 'torproxy', // Defaults to 'localhost'.
          socksPort: 9050, // Defaults to 1080.
          // Optional credentials
          //  socksUsername: 'proxyuser',
          //  socksPassword: 'p@ssw0rd',
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
        /*  fs.writeFile('./src/config/proxy.html', buffer.join(''), function(err) {

          });*/
        subscriber.complete();

      }).on('error', (e) => {


        subscriber.error(e);
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

        if (e.code !== 'Z_DATA_ERROR') {
          subscriber.error(e);
        }

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
