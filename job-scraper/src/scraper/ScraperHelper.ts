import * as cheerio from 'cheerio';
import { EnumVariationType } from './lib/EScraper';
import { AxiosRequestConfig } from 'axios';
import { getRandomInt, isNil } from '../shared/utils/shared.utils';
import { from } from 'rxjs';
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

    return contents.indexOf('api-services-support@amazon.com') > -1;
  }
  public static getRandomUserAgent = () => {
    const index = getRandomInt(ScraperHelper.USER_AGENT_LIST.length);
    return ScraperHelper.USER_AGENT_LIST[index];
  };

  public getRandomProxy() {
    const isActive: string = this.configService.get<string>('USE_PROXY');

    if (isActive === 'true') {

      const index = getRandomInt(ScraperHelper.PROXY_LIST.length);
      const proxy = ScraperHelper.PROXY_LIST[index];
      return proxy;
    }
    return false;
  };



  public requestConfig(proxyParam: string = null): AxiosRequestConfig {
    const headersRequest = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip',
      'User-Agent': ScraperHelper.getRandomUserAgent(),
       'Connection': 'keep-alive',

    };

    const requestConfig: AxiosRequestConfig = { headers: headersRequest, timeout: 10000 };
    return requestConfig;
  };

  public static getTypeVariation(contents: string): EnumVariationType {
    if (contents) {
      const isColor = contents.indexOf('color') > -1;
      const isSize = contents.indexOf('size') > -1;
      const isFit = contents.indexOf('fit') > -1;
      if (isColor) {
        return EnumVariationType.COLOR;
      }
      if (isSize) {
        return EnumVariationType.SIZE;
      }
      if (isFit) {
        return EnumVariationType.FIT;
      }
      return null;
    }
    return null;
  }

  public static getTextVariation(contents: string, deletText: string = ''): string {
    if (contents) {
      const text: string = contents.replace(deletText, '');

      return text;
    }
    return null;

  }

  public static getPrix(contents: string, deletText: string = ''): number {
    const regex = /(\$[0-9,]+(\.[0-9]{2})?)/;
    if (contents && contents.match(regex)) {
      let price: number = 0;
      contents.match(regex).some((match) => {
        price = parseFloat(contents.replace(deletText, ''));

        return true;
      });
      return price;
    }
    return null;

  }

  public static getLinkVariationAmazone(contents: string, link: string = ''): string {
    if (isNil(contents)) {
      return link;
    }
    const linkBase: string = link;
    const linkVariation = contents.slice(1);

    const linkReplace = linkBase.substring(linkBase.indexOf('dp'), linkBase.length);

    const text: string = linkBase.replace(linkReplace, linkVariation);

    return text;
  }

  public static getScript(contents: string, key: string): CheerioStatic {
    let $: CheerioStatic = ScraperHelper.parseHtml(contents);
    const scripts: CheerioElement[] = $('script').toArray();
    const cheerioStatic: CheerioStatic = scripts.map((script) => {
      $ = ScraperHelper.parseElement(script);
      return $;
    }).filter((script: CheerioStatic) => {
      return script.root().html().indexOf(key) > -1;
    })[0];

    return cheerioStatic;
  }

  public static PROXY_LIST = [];
  public static USER_AGENT_LIST = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:64.0) Gecko/20100101 Firefox/64.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.81 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:64.0) Gecko/20100101 Firefox/64.0',
    'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.116',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763',
    'Mozilla/5.0 (X11; Linux x86_64; rv:64.0) Gecko/20100101 Firefox/64.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.81 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299',
    'Mozilla/5.0 (Windows NT 6.1; rv:60.0) Gecko/20100101 Firefox/60.0',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 12_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.81 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.99 YaBrowser/19.1.0.2644 Yowser/2.5 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.116',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:64.0) Gecko/20100101 Firefox/64.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.81 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 YaBrowser/18.11.1.805 Yowser/2.5 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:60.0) Gecko/20100101 Firefox/60.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.81 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:64.0) Gecko/20100101 Firefox/64.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 YaBrowser/18.11.1.805 Yowser/2.5 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.81 Safari/537.36',
  ];

  public static getCurrency(country) {

    switch (ScraperHelper.getBaseUrlAmazone(country)) {
      case 'https://www.amazon.com/':
        return 'USD';
      case 'https://www.amazon.co.uk/':
        return 'GBP';
      case 'https://www.amazon..de/':
        return 'EUR';
      case 'https://www.amazon..fr/':
        return 'EUR';
      case 'https://www.amazon.it/':
        return 'EUR';
      case 'https://www.amazon.in/':
        return 'INR';
      case 'https://www.amazon.ca/':
        return 'CAD';
      case 'https://www.amazon.es/':
        return 'EUR';
    }
  }

  public static EXIT_CODES = {
    SUCCESS: 'SUCCESS',
    ERROR_USER_FUNCTION_THREW: 'ERROR_USER_FUNCTION_THREW',
    ERROR_UNKNOWN: 'ERROR_UNKNOWN',
    ERROR_CAPTCHA: 'ERROR_CAPTCHA',
    ERROR_PROXY: 'ERROR_PROXY',
    ERROR_PROXY_TIME_OUT: 'ERROR_PROXY_TIME_OUT',
    ERROR_PROXY_EMPTY: 'ERROR_PROXY_EMPTY',
  };

  public static DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'; // eslint-disable-line max-len

  public static KEYWORD_LIST = from(['nintendoswitch', 'ps4', 'laptop', 'kindle', 'ssd', 'fidgetspinner', 'tablet', 'headphones', 'ipad', 'switch', 'fitbit', 'iphone', 'iphone7', 'tv', 'gameofthrones', 'lego', 'harrypotter', 'iphone6', 'alexa', 'books', 'bluetoothheadphones', 'monitor', 'iphonex', 'xboxone', 'externalharddrive', 'firestick', 'playstation4', 'instantpot', 'iphone6s', 'microsdcard', 'shoes', 'starwars', 'samsung', 'backpack', 'ps4pro', 'mouse', 'wirelessheadphones', 'drone', 'applewatch', 'smartwatch', 'echo', 'samsunggalaxys8', 'iphone8', 'powerbank', 'roku', 'keyboard', 'xiaomi', 'redmi4', 'gtx1060', 'redmi4a', 'gtx1070', 'airpods', 'bluetoothspeakers', 'ps4controller', 'gtx1080', 'ps4games', 'waterbottle', 'smartphone', 'gamingmouse', 'toiletpaper', 'earphones', 'camera', 'echodot', 'hdmicable', 'airfryer', 'laptops', 'gamingchair', 'wirelessmouse', 'huawei', 'kindlefire', 'doctorwho', 'amazon', 'printer', 'sdcard', 'gopro', 'xboxonecontroller', 'chromecast', 'xboxonex', 'desk', 'primevideo', 'vans', 'watch', 'pokemon', 'notebook', 'giftcard', 'iphone7plus', 'gamingpc', 'samsunggalaxys7', 'nike', 'popsocket', 'iphonecharger', 'officechair', 'windows10', 'anker', 'mousepad', 'iphone7case', 'iphonese', 'wirelessearbuds', 'earbuds', 'mobile']);

}
