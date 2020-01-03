import { HttpService, Injectable } from '@nestjs/common';
import { IScraper } from './IScraper';

import { Observable, of, timer } from 'rxjs';
import { catchError, map, mergeMap, retryWhen, tap } from 'rxjs/operators';
import { ScraperHelper } from '../ScraperHelper';
import * as scrapeIt from 'scrape-it';
import { AxiosResponse } from 'axios';
import { ImenuHome } from './ImenuHome';
import { Exception } from '../../shared/Exception/exception';
import { deleteSpace, getValueFromParameters, isNil, parseDateFromJson, validator } from '../../shared/utils/shared.utils';
import { RxjsUtils } from '../../shared/utils/rxjs-utils';
import { NetworkService } from '../../shared/request/network.service';

@Injectable()
export class ScraperAmazoneService implements IScraper {
  constructor(private readonly httpService: NetworkService, private readonly scraperHelper: ScraperHelper) {
  }

// scraping the specific page

  // scraping the specific page
  public scrapeUrlHome(link: string): Observable<any> {
    let renewTorSession: boolean = false;
    const result$ = of(1).pipe(
      mergeMap(x => {
        return this.httpService.getTor(link, this.scraperHelper.requestConfig(), renewTorSession).pipe(
          catchError((err) => {

            return of(null);
          }),
          tap((res: any) => {

            if (isNil(res)) {
              renewTorSession = true;
              throw new Exception('scrapeAmazoneUrlHome : error will be picked up by retryWhen [data => null]', ScraperHelper.EXIT_CODES.ERROR_UNKNOWN);
            }
          }),

          map((res: any) => {
            //  console.log(res)
            const data: any = scrapeIt.scrapeHTML(res,
              {
                isCaptcha: {
                  selector: 'form                                                                                                                                                                                 ',
                  how: 'html',
                  convert: (x: string) => {
                    return x ? x.indexOf('Captcha') > -1 : false;
                  },
                },
                sourceHtml: {
                  selector: 'div.s-result-list                                                                                                                                                                                   ',
                  how: 'html',
                  convert: (x: string) => {
                    //TODO
                    return 'x';
                  },
                },
                produits: {
                  listItem: 'div.s-result-item',
                  data: {
                    asin: {//Amazon Standard Identification Number
                      attr: 'data-asin',
                      //  convert: (x: string) => `${x}`,
                    },
                    title: {//manufacturer principale
                      selector: 'span.a-text-normal',
                      how: 'html',
                      //  convert: (x: string) => x,
                    },
                    image: {//image principale
                      selector: 'img',
                      attr: 'src',
                      convert: (x: string) => `${x}`,
                    },
                    link: {//link principale
                      selector: 'div span:nth-child(2) a',
                      attr: 'href',
                      convert: (x: string) => `https://www.amazon.com${x}`,
                    },
                    reviews: {//image principale
                      selector: 'div span:nth-child(2) a span',
                      how: 'html',
                      convert: (x: string) => isNil(x) ? 0 : x.replace(',', ''),
                    },
                    shipping: {//shipping
                      selector: 'i.a-icon-prime',
                      attr: 'aria-label',
                      convert: (x: string) => x,
                    },
                    price: {//price
                      selector: 'span.a-price span.a-offscreen',
                      how: 'html',
                      convert: (x: string) => isNil(x) ? 0 : x.replace('$', ''),
                    },
                    images: {//image tail
                      selector: 'img',
                      attr: 'srcset',
                      convert: (x: string) => {

                        const imagestemps = x.split(',');
                        const images: any[] = [];
                        for (let i = 0; i < imagestemps.length; i++) {
                          const imagestempssplit = imagestemps[i].split(' ');
                          if (validator.isURL(imagestempssplit[1])) {
                            images.push({
                              image: String(imagestempssplit[1]),
                              size: String(imagestempssplit[2]),
                            });
                          }

                        }
                        return images;
                      },
                    },
                  },
                },
              },
            );
            return data;
          }),
          map(data => {

            if (isNil(data)) {
              renewTorSession = true;
              throw new Exception({
                message: 'scrapeAmazoneUrlHome: error will be picked up by retryWhen',
                link,
              }, ScraperHelper.EXIT_CODES.ERROR_UNKNOWN);
            } else if (!!data.produits && data.produits.length === 0) {
              if (data.isCaptcha) {
                renewTorSession = true;
                throw new Exception('scrapeAmazoneUrlHome : error will be picked up by retryWhen [isCaptcha]', ScraperHelper.EXIT_CODES.ERROR_CAPTCHA);
              }

            }
            renewTorSession = false;
            return data['produits'];
          }),
        );
      }),
      retryWhen(RxjsUtils.genericRetryStrategy()),
    );

    return result$;

  }

  public productDetail(link: string, baseUrlAmazone: string): Observable<any> {
    let renewTorSession: boolean = false;
    const linkDetail: string = link;
    const result$ = of(1).pipe(
      mergeMap(x => {
        return this.httpService.getTor(linkDetail, this.scraperHelper.requestConfig(), renewTorSession).pipe(
          catchError((err) => {

            return of(null);
          }),
          tap((res: any) => {

            if (isNil(res)) {
              renewTorSession = true;
              throw new Exception('productDetail : error will be picked up by retryWhen [data => null]', ScraperHelper.EXIT_CODES.ERROR_UNKNOWN);
            }
          }),
          map((res: any) => {

            const data: any = scrapeIt.scrapeHTML(res, {
              isCaptcha: {
                selector: 'form                                                                                                                                                                                 ',
                how: 'html',
                convert: (x: string) => {
                  return x ? x.indexOf('Captcha') > -1 : false;
                },
              },
              sourceHtml: {
                selector: 'html                                                                                                                                                                                   ',
                how: 'html',
                convert: (x: string) => {
                  return x;
                },
              },
              category: {
                selector: 'div.a-padding-medium                                                                                                                                                                                   ',
                how: 'text',
                trim: true,
                convert: (x: string) => {
                  let category = x.trim().replace(/^\s*\n/gm, '').split('›');
                  category = category.map(x => {
                    return x.replace(/^\s*\n/gm, '').trim();
                  });

                  return category;
                },
              },
              manufacturer: {
                selector: 'html                                                                                                                                                                                   ',
                how: 'html',
                convert: (x: string) => {
                  return this.manufacturer(x);
                },
              },
              productTitle: {//
                selector: 'span.a-size-large',
                how: 'html',
              },
              customerRatings: {
                selector: '#averageCustomerReviews span.a-size-base',
                how: 'html',
                convert: (x: string) => x ? x.match(/(\d+)/)[0] : null,
              },

              answeredQuestions: {
                selector: '.askATFLink span                                                                                                                                                                                           ',
                how: 'html',
                convert: (x: string) => x ? x.match(/(\d+)/)[0] : null,
              },
              crossedprice: {
                selector: 'span.priceBlockStrikePriceString                                                                                                                                                                                           ',
                how: 'html',
                convert: (x: string) => x,
              },
              price: {
                selector: 'span.priceBlockBuyingPriceString                                                                                                                                                                                           ',
                how: 'html',
                convert: (x: string) => x,
              },
              price01: {
                selector: 'span.priceBlockSalePriceString                                                                                                                                                                                       ',
                how: 'html',
                convert: (x: string) => x,
              },
              price02: {
                selector: 'strong.priceLarge                                                                                                                                                                                       ',
                how: 'html',
                convert: (x: string) => x,
              }, priceMin: {
                selector: 'strong.priceLarge                                                                                                                                                                                       ',
                how: 'html',
                convert: (x: string) => x,
              }, priceMax: {
                selector: 'strong.priceLarge                                                                                                                                                                                       ',
                how: 'html',
                convert: (x: string) => x,
              },
              images: {
                selector: 'html                                                                                                                                                                                   ',
                how: 'html',
                convert: (x: string) => {
                  return this.imagesProduct(x);
                },
              },
              childProduct: {
                selector: 'form#twister                                                                                                                                                                                  ',
                how: 'html',
                convert: (x: string) => {
                  return this.childProduct(x,
                    linkDetail);
                },
              },
              rating: {
                selector: 'i.a-star-4-5',
                how: 'text',
                convert: (x: string) => {
                  return isNil(x) ? 0 : x.split(' ')[0].replace(',', '');
                },
              },
              linkReviews: {
                selector: 'a[data-hook=\'see-all-reviews-link-foot\']',
                attr: 'href',
                convert: (x: string) => {
                  return x ? `${baseUrlAmazone}${x}&pageNumber=1&filterByStar=five_star` : null;
                },
              },
            });
            return data;
          }),
          map(data => {

            if (isNil(data)) {
              renewTorSession = true;
              throw new Exception({
                message: 'productDetail: error will be picked up by retryWhen',
                link,
              }, ScraperHelper.EXIT_CODES.ERROR_UNKNOWN);
            }
            if (!!data) {
              if (data['isCaptcha']) {
                renewTorSession = true;
                throw new Exception('productDetail : error will be picked up by retryWhen [isCaptcha]', ScraperHelper.EXIT_CODES.ERROR_CAPTCHA);
              }
              //  throw new Exception('productDetail: error will be picked up by retryWhen');
            }
            renewTorSession = false;
            data['link'] = link;
            return data;
          }),
        );
      }),
      retryWhen(RxjsUtils.genericRetryStrategy({
        scalingDuration: 2000,
        excludedStatusCodes: [500],
      })));
    return result$;
  }

  public productReviews(link: string): Observable<any> {
    let renewTorSession: boolean = false;
    const linkDetail: string = link;
    const result$ = of(1).pipe(
      mergeMap(x => {
        return this.httpService.getTor(linkDetail, this.scraperHelper.requestConfig(), renewTorSession).pipe(
          catchError((err) => {

            return of(null);
          }),
          tap((res: any) => {

            if (isNil(res)) {
              renewTorSession = true;
              throw new Exception('productReviews : error will be picked up by retryWhen [data => null]', ScraperHelper.EXIT_CODES.ERROR_UNKNOWN);
            }
          }),
          map((res: any) => {
            const data: any = scrapeIt.scrapeHTML(res, {
              isCaptcha: {
                selector: 'form                                                                                                                                                                                 ',
                how: 'html',
                convert: (x: string) => {
                  return x ? x.indexOf('Captcha') > -1 : false;
                },
              },
              /*sourceHtml: {
                selector: 'html                                                                                                                                                                                   ',
                how: 'html',
                convert: (x: string) => {
                  return x;
                },
              },*/
              reviews: {
                selector: '.a-spacing-medium span.a-size-base.a-color-secondary                                                                                                                                                                                  ',
                how: 'text',
                trim: true,
                convert: (x: string) => {

                  return isNil(x) ? 0 : x.split(' ')[0].replace(',', '');
                },
              },
              rating: {
                selector: 'span[data-hook=\'rating-out-of-text\']                                                                                                                                                                               ',
                how: 'text',
                trim: true,
                convert: (x: string) => {

                  return isNil(x) ? 0 : x.split(' ')[0].replace(',', '');
                },
              },
              ratings: {
                selector: 'table#histogramTable                                                                                                                                                                            ',
                how: 'html',
                trim: true,
                convert: (x: string) => {

                  return this.getRatingsProduct(x);
                },
              },
              topCritical: {
                selector: 'div.critical-review                                                                                                                                                                            ',
                how: 'html',
                trim: true,
                convert: (x: string) => {

                  return this.getReview(x);
                },
              },
              topPositive: {
                selector: 'div.positive-review                                                                                                                                                                           ',
                how: 'html',
                trim: true,
                convert: (x: string) => {

                  return this.getReview(x);
                },
              },
              reviewsContent: {
                listItem: 'div[data-hook=\'review\'] ',
                data: {
                  reviewContent: {
                    selector: 'div.celwidget                                                                                                                                                                  ',
                    how: 'html',
                    trim: true,
                    convert: (x: string) => {
                      return this.getReview(x);
                    },
                  },
                },

              },
            });
            return data;
          }),
          map(data => {
            if (isNil(data)) {
              renewTorSession = true;
              throw new Exception({
                message: 'productReviews: error will be picked up by retryWhen',
                link,
              }, ScraperHelper.EXIT_CODES.ERROR_UNKNOWN);
            }
            if (!!data) {
              if (data['isCaptcha']) {
                renewTorSession = true;
                throw new Exception('productReviews : error will be picked up by retryWhen [isCaptcha]', ScraperHelper.EXIT_CODES.ERROR_CAPTCHA);
              }
              //  throw new Exception('productDetail: error will be picked up by retryWhen');
            }
            renewTorSession = false;
            return data;
          }),
        );
      }),
      retryWhen(RxjsUtils.genericRetryStrategy({
        scalingDuration: 2000,
        excludedStatusCodes: [500],
      })));
    return result$;

  }

  private childProduct(contents: string, link: string): any {
    const variationProduits: any[] = [];
    if (contents != null) {
      let $: CheerioStatic = ScraperHelper.parseHtml(contents);
      const produitsDivElements: CheerioElement[] = $('div').toArray();
      produitsDivElements.forEach((produitsDivElement: CheerioElement) => {

        const $div = ScraperHelper.parseElement(produitsDivElement);
        const produitsElements: CheerioElement[] = $div('li').toArray();

        produitsElements.forEach((produitsElement) => {
          $ = ScraperHelper.parseElement(produitsElement);
          const variationProduit: any = {};

          variationProduit.type = ScraperHelper.getTypeVariation(produitsElement.attribs['id']);
          variationProduit.text = ScraperHelper.getTextVariation(produitsElement.attribs['title'], 'Click to select ');
          variationProduit.asin = ScraperHelper.getTextVariation(produitsElement.attribs['data-defaultasin']);
          variationProduit.link = ScraperHelper.getLinkVariationAmazone(produitsElement.attribs['data-dp-url'], link);
          variationProduit.price = ScraperHelper.getPrix($('span.a-size-mini').text().trim(), '$');
          variationProduit.image = $('img.imgSwatch').attr('src');

          variationProduits.push(variationProduit);
        });
      });

      return variationProduits;
    }
    return variationProduits;

  }

  private getReview(contents: string): any {
    const reviewProduct: any = {};
    if (contents != null) {
      let $: CheerioStatic = ScraperHelper.parseHtml(contents);

      reviewProduct.date = parseDateFromJson($('span.review-date').text());
      reviewProduct.text = $('span.a-size-base').text();

    }
    return reviewProduct;

  }

  private getRatingsProduct(contents: string): any {
    const ratingsProduct: any[] = [];
    if (contents != null) {
      let $: CheerioStatic = ScraperHelper.parseHtml(contents);

      const ratingElements: CheerioElement[] = $('tr').toArray();

      ratingElements.forEach((ratingElement) => {
        $ = ScraperHelper.parseElement(ratingElement);
        const ratingProduct: any = {};

        ratingProduct.name = deleteSpace($('td.aok-nowrap > span > a ').text());
        ratingProduct.value = deleteSpace($('td.a-nowrap > span.a-size-base > a ').text());

        ratingsProduct.push(ratingProduct);
      });

      return ratingsProduct;
    }
    return ratingsProduct;

  }

  private imagesProduct(contents: string): any {
    const imagesProduct: any[] = [];

    if (contents != null) {
      const $: CheerioStatic = ScraperHelper.getScript(contents, 'colorImages');
      if ($) {
        const html: string[] = $.root().html().match(ScraperHelper.regex) || [];

        html.forEach((match) => {

          imagesProduct.push(match);
        });
        return imagesProduct;
      }

    }
    return [];
  }

  private manufacturer(contents: string): any {
    const manufacturer: string = null;

    if (contents != null) {
      let $: CheerioStatic = ScraperHelper.parseHtml(contents);
      if ($) {
        const href01: string = $('div#titleBlockLeftSection > div > div > a').attr('href');
        const href02: string = $('div#bylineInfo_feature_div > div > a').attr('href');
        const alt: string = $('div#brandBarLogoWrapper  > a > img').attr('alt');

        if (validator.isNotEmpty(href01)) {
          return getValueFromParameters(href01, 'field-lbr_brands_browse-bin');
        }
        if (validator.isNotEmpty(href02)) {
          return getValueFromParameters(href02, 'field-lbr_brands_browse-bin');
        }
        if (validator.isNotEmpty(alt)) {
          return alt;
        }

      }

    }
    return manufacturer;
  }

}
