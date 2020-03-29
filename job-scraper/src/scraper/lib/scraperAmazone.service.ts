import { Injectable } from '@nestjs/common';
import { IScraper } from './IScraper';

import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ScraperHelper } from '../ScraperHelper';
import * as scrapeIt from 'scrape-it';
import {
  deleteSpace,
  getValueFromParameters,
  isNil,
  parseDateFromJson,
  validator,
} from '../../shared/utils/shared.utils';
import { ProxyService } from './proxy.service';
import { IDepartment } from '../../shared/interface/departments.amazon';


@Injectable()
export class ScraperAmazoneService implements IScraper {

  constructor(private readonly httpService: ProxyService) {
  }

  public scrapeUrlHome(link: string): Observable<any> {
    const result$ = of(1).pipe(
      mergeMap(x => {
        return this.httpService.getTor(link).pipe(
          map((res: any) => {
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
                    reviews: {
                      selector: 'div div.a-spacing-top-micro span:nth-child(2)',
                      attr: 'aria-label',
                      convert: (x: string) => {
                        return isNil(x) ? 0 : x.replace(',', '');
                      },
                    },
                    rating: {
                      selector: 'div div.a-spacing-top-micro span:nth-child(1)',
                      attr: 'aria-label',
                      convert: (x: string) => {
                        return isNil(x) ? 0 : x.split(' ')[0];
                      },
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
            return data['produits'];
          }),
        );
      }),
    );

    return result$;

  }

  public scrapeUrlSalesAffers(link: string): Observable<any> {


    const result$ = of(1).pipe(
      mergeMap(x => {
        return this.httpService.getPuppeteer(link).pipe(
          map((res: any) => {

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
                  selector: '#widgetContent                                                                                                                                                                                ',
                  how: 'html',
                  convert: (x: string) => {

                    //console.log(res)
                    //TODO
                    return 'x';
                  },
                },
                produits: {
                  listItem: 'div.a-section.layer:nth-of-type(2)',
                  data: {
                    title: {
                      selector: 'a.dealTitleTwoLine',
                      how: 'text',
                      convert: (x: string) => {
                        return x;
                      },
                    },
                    asin: {
                      selector: 'a.dealTitleTwoLine',
                      attr: 'href',
                      convert: (x: string) => {
                        const x$ = x.substr(x.indexOf('dp/') + 3);
                        return x$.substring(0, x$.indexOf('/'));
                      },
                    },
                    image: {//image principale
                      selector: 'img',
                      attr: 'src',
                      convert: (x: string) => `${x}`,
                    },
                    link: {//link principale
                      selector: 'a.dealTitleTwoLine',
                      attr: 'href',
                      convert: (x: string) => {

                        return x.indexOf('https://www.amazon.com') !== -1 ? x :
                          `https://www.amazon.com${x}`;
                      },
                    },
                    reviews: {
                      selector: 'div div.a-spacing-top-micro span:nth-child(2)',
                      attr: 'aria-label',
                      convert: (x: string) => {
                        return isNil(x) ? 0 : x.replace(',', '');
                      },
                    },
                    rating: {
                      selector: 'div div.a-spacing-top-micro span:nth-child(1)',
                      attr: 'aria-label',
                      convert: (x: string) => {
                        return isNil(x) ? 0 : x.split(' ')[0];
                      },
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
            //  console.log( data['produits'])

            return data['produits'];
          }),
        );
      }),
    );

    return result$;

  }

  public getCategorysSalesOffers(link: string): Observable<any> {


    const result$ = of(1).pipe(
      mergeMap(x => {
        return this.httpService.getPuppeteer(link).pipe(
          map((res: any) => {

            const data: any = scrapeIt.scrapeHTML(res,
              {
                categorys: {
                  listItem: 'span[data-action=\'gbfilter-checkbox\']',
                  data: {
                    name: {
                      selector: 'span.a-checkbox-label',
                      how: 'html',
                      convert: (x: string) => {

                        return x;
                      },
                    },
                    id: {
                      attr: 'data-gbfilter-checkbox',
                      convert: (x: any) => {
                        return JSON.parse(x).value;
                      },
                    },
                  },
                },
              },
            );
            return data;
          }),
          map(data => {
            const categorys: IDepartment[] = (data['categorys'] as IDepartment[]).filter((category: IDepartment) => validator.isNumberString(category.id));
            return categorys;
          }),
        );
      }),
    );

    return result$;

  }

  public productDetail(link: string, baseUrlAmazone: string): Observable<any> {

    const linkDetail: string = link;
    const result$ = this.httpService.getTor(linkDetail).pipe(
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
              //TODO
              return 'x';
            },
          },
          categorys: {
            selector: 'div.a-padding-medium                                                                                                                                                                                   ',
            how: 'text',
            trim: true,
            convert: (x: string) => {

              let categorys = x.trim().replace(/^\s*\n/gm, '').split('›');
              categorys = categorys.map(x => {
                return x.replace(/^\s*\n/gm, '').trim();
              }).filter(x => x.indexOf('Back to results') < 0);
              return categorys;
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
          }
          , priceDeal: {
            selector: 'span.priceBlockDealPriceString                                                                                                                                                                                       ',
            how: 'html',
            convert: (x: string) => x,
          }
          , priceMin: {
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

          descriptions: {
            selector: 'div#productDescription',
            how: 'html',
            convert: (x: string) => {

              return this.description(x);
            },
          },
        });
        return data;
      }),
      map(data => {
        data['link'] = link;
        return data;
      }));
    return result$;
  }

  public productReviews(link: string): Observable<any> {

    const linkDetail: string = link;
    const result$ = this.httpService.getTor(linkDetail).pipe(
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
        return data;
      }),
    );
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
      const $: CheerioStatic = ScraperHelper.parseHtml(contents);

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
        const html: string[] = $.root().html().match(ScraperHelper.regexImages) || [];

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

  private description(contents: string): any {
    const descriptions: string[] = [];

    if (contents != null) {
      let $: CheerioStatic = ScraperHelper.parseHtml(contents);
      if ($) {
        const ratingElements: CheerioElement[] = $('p').toArray();

        ratingElements.forEach((ratingElement) => {
          $ = ScraperHelper.parseElement(ratingElement);

          descriptions.push($('p').text());
        });

      }

    }

    return descriptions.filter(description => description.trim() !== '');
  }

  private getProductfromScript(contents: string): any {
    const puppeteer = require('puppeteer');
    const imagesProduct: any[] = [];

    if (contents != null) {
      const $: CheerioStatic = ScraperHelper.getScript(contents, 'dcsServerResponse');
      if ($) {


        const scriptProducts: any = $.root().html().replace('<script type="text/javascript">', '').replace('</script>', '');


        const html: string[] = $.root().html().match(ScraperHelper.regexImages) || [];

        html.forEach((match) => {

          imagesProduct.push(match);
        });
        return imagesProduct;
      }

    }
    return [];
  }

}
