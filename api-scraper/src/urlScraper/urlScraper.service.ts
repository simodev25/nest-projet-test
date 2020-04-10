import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UrlRequestOptions } from './classes/url.request.Options';
import { RequesterType } from './enums/requesterType';


@Injectable()
export class UrlScraperService {

  constructor(@Inject('UrlScraperProxyFactory') private readonly scraperClient: ClientProxy) {

  }

  scraperUrl(urlRequestOptions: UrlRequestOptions) {
    const pattern = { cmd: 'api-url-scraper' };
   /* const urlRequestOptions: UrlRequestOptions = new UrlRequestOptions('https://www.amazon.com/UMIDIGI-Uwatch3-Activity-Smartwatch-Waterproof/dp/B082F56GM3/ref=gbps_img_m-9_475e_46b36682?smid=A2OH8BLC66O6WK&pf_rd_p=5d86def2-ec10-4364-9008-8fbccf30475e&pf_rd_s=merchandised-search-9&pf_rd_t=101&pf_rd_i=15529609011&pf_rd_m=ATVPDKIKX0DER&pf_rd_r=WH2QVPN0F4K04BWSYNNV'
      , RequesterModule.REQUEST);
    urlRequestOptions.scrapeOptions = {
      categorys: {
        selector: 'div.a-padding-medium                                                                                                                                                                                   ',
        how: 'text',
        trim: true,
      },
      productTitle: {//
        selector: 'span.a-size-large',
        how: 'html',
      },
      customerRatings: {
        selector: '#averageCustomerReviews span.a-size-base',
        how: 'html',
      },

      answeredQuestions: {
        selector: '.askATFLink span                                                                                                                                                                                           ',
        how: 'html',
      },
      crossedprice: {
        selector: 'span.priceBlockStrikePriceString                                                                                                                                                                                           ',
        how: 'html',
      },
      price: {
        selector: 'span.priceBlockBuyingPriceString                                                                                                                                                                                           ',
        how: 'html',
      },
      price01: {
        selector: 'span.priceBlockSalePriceString                                                                                                                                                                                       ',
        how: 'html',
      },
      price02: {
        selector: 'strong.priceLarge                                                                                                                                                                                       ',
        how: 'html',
      }
      , priceDeal: {
        selector: 'span.priceBlockDealPriceString                                                                                                                                                                                       ',
        how: 'html',
      }
      , priceMin: {
        selector: 'strong.priceLarge                                                                                                                                                                                       ',
        how: 'html',
      }, priceMax: {
        selector: 'strong.priceLarge                                                                                                                                                                                       ',
        how: 'html',
      },

    };
*/

    return this.scraperClient.send(pattern, urlRequestOptions);
   // return this.scraperClient.send(pattern, urlRequestOptions);
  }
}
