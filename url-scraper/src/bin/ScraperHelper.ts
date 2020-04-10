import * as cheerio from 'cheerio';
import { AxiosRequestConfig } from 'axios';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ScraperHelper {

  constructor(private readonly configService: ConfigService) {
  }

  public static regexImages = /(https:)[A-Z0-9a-z-\.\/_]*(?:jpg|gif|png)/mg;
  public static searchUrlBase = /(https:)[A-Z0-9a-z-\.\/_]*(?:jpg|gif|png)/mg;

  public static getBaseUrlAmazone = (country) => {
    const baseUrls = {
      US: 'https://www.amazon.com/',
      GB: 'https://www.amazon.co.uk/',
      DE: 'https://www.amazon.de/',
      ES: 'https://www.amazon.es/',
      FR: 'https://www.amazon.fr/',
      IT: 'https://www.amazon.it/',
      IN: 'https://www.amazon.in/',
      CA: 'https://www.amazon.ca/',
    };
    const url = baseUrls[country];
    if (!url) {
      throw new Error('Selected country is not supported, contact us.');
    }
    return url;
  };

  public static parseHtml(contents: string): CheerioStatic {

    return cheerio.load(contents);
  }

  public static parseElement(element: CheerioElement): CheerioStatic {

    return cheerio.load(element, { ignoreWhitespace: true });
  }

  public static isCaptcha(contents: string): boolean {

    return contents.indexOf('api-services-support@amazon.com') > -1 || contents.indexOf('why_captcha_headline') > -1;
  }

  public static isPageNotFound(contents: string): boolean {

    return contents.indexOf('Page Not Found') > -1;
  }


  public requestConfig(proxyParam: string = null): AxiosRequestConfig {
    const headersRequest = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip',
      'User-Agent': ScraperHelper.DEFAULT_USER_AGENT,
      'Connection': 'keep-alive',

    };

    const requestConfig: AxiosRequestConfig = { headers: headersRequest, timeout: 10000 };
    return requestConfig;
  };


  public static EXIT_CODES = {
    SUCCESS: 'SUCCESS',
    ERROR_USER_FUNCTION_THREW: 'ERROR_USER_FUNCTION_THREW',
    ERROR_UNKNOWN: 'ERROR_UNKNOWN',
    ERROR_CAPTCHA: 'ERROR_CAPTCHA',
    ERROR_PROXY: 'ERROR_PROXY',
    ERROR_PROXY_TIME_OUT: 'ERROR_PROXY_TIME_OUT',
    ERROR_PROXY_EMPTY: 'ERROR_PROXY_EMPTY',
    PAGE_NOT_FOUND: 'PAGE_NOT_FOUND',
  };

  public static DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'; // eslint-disable-line max-len


}
