import { Injectable, NotFoundException } from '@nestjs/common';
import { IScraper } from './IScraper';
import { NestCrawlerService } from 'nest-crawler';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScraperHelper } from '../ScraperHelper';

@Injectable()
export class ScraperAmazoneService implements IScraper {
  constructor(private readonly crawler: NestCrawlerService) {

  }

// scraping the specific page
  public scrapeMenuHome(url: string): Observable<any> {

    const data: any = this.crawler.fetch({
      target: url,
      waitFor: 3 * 1000,
      fetch: {
        isCaptcha: {
          selector: 'form                                                                                                                                                                                 ',
          how: 'html',
          convert: (x: string) => {
            return x.indexOf('Captcha') > -1;
          },
        },
        searchWords: {
          listItem: 'select option',
          data: {
            searchWord: {
              how: 'text',
              convert: (x: string) => `${x}`,
            },
          },
        },
      },
    })
    return from(data).pipe(map(data => {
      console.log('data',data);
      if (!!data['searchWords'] && data['searchWords'].length === 0) {
        //
        throw new NotFoundException('scrapeMenuHome : error will be picked up by retryWhen');
      }

      return data['searchWords'];
    }));

  }

  // scraping the specific page
  public scrapeUrlHome(url: string): Observable<any> {

    const data: any = this.crawler.fetch({
      target: url,

      waitFor: 3 * 1000,
      fetch: {
        sourceHtml: {
          selector: 'div.s-result-list                                                                                                                                                                                   ',
          how: 'html',
          convert: (x: string) => {
            return x;
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
              convert: (x: string) => `https://www.amazon.com/${x}`,
            },
            reviews: {//image principale
              selector: 'div span:nth-child(2) a span',
              how: 'html',
              //   convert: (x: string) => x,
            },
            shipping: {//shipping
              selector: 'i.a-icon-prime',
              attr: 'aria-label',
              //   convert: (x: string) => x,
            },
            images: {//image tail
              selector: 'img',
              attr: 'srcset',
              convert: (x: string) => {

                const imagestemps = x.split(',');
                const images: any[] = [];
                for (let i = 0; i < imagestemps.length; i++) {
                  const imagestempssplit = imagestemps[i].split(' ');

                  images.push({
                    image: String(imagestempssplit[1]),
                    size: String(imagestempssplit[2]),
                  });
                }
                return images;
              },
            },
          },
        },
      },
    });
     from(data).subscribe(data=> console.log('*****', data['sourceHtml']))
    return from(data).pipe( map(data => {
      if (!!data['produits'] && data['produits'].length === 0) {
        //
        throw new NotFoundException('scrapeAmazoneUrlHome: error will be picked up by retryWhen');
      }

      return data['produits'];
    }));
  }

  public productDetail(link: string): Observable<any> {

    const linkDetail: string = link;
    const productDetail: any = this.crawler.fetch({
      target: linkDetail,
      fetch: {
        sourceHtml: {
          selector: 'html                                                                                                                                                                                   ',
          how: 'html',
          convert: (x: string) => {
            return x;
          },
        },
        manufacturer: 'a#bylineInfo',
        productTitle: {//manufacturer principale
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
          selector: 'ul.a-unordered-list.a-declarative                                                                                                                                                                                   ',
          how: 'html',
          convert: (x: string) => {
            return this.childProduct(x,
              linkDetail);
          },
        },
      },

    });
    // console.log(data)

    return from(productDetail).pipe(map(productDetail => {
      productDetail['link'] = link;
      return productDetail;
    }));
  }

  private childProduct(contents: string, link: string): any {
    const variationProduits: any[] = [];
    if (contents != null) {
      let $: CheerioStatic = ScraperHelper.parseHtml(contents);
      const produitsElements: CheerioElement[] = $('li').toArray();

      produitsElements.forEach((produitsElement) => {
        $ = ScraperHelper.parseElement(produitsElement);
        const variationProduit: any = {};
        variationProduit.type = ScraperHelper.getTypeVariation(produitsElement.attribs['id']);
        variationProduit.text = ScraperHelper.getTextVariation(produitsElement.attribs['title'], 'Click to select ');
        variationProduit.asin = ScraperHelper.getTextVariation(produitsElement.attribs['data-defaultasin']);
        variationProduit.link = ScraperHelper.getLinkVariationAmazone(produitsElement.attribs['data-dp-url'], link);
        variationProduit.price = $('span.a-size-mini').text().trim();
        variationProduit.image = $('img.imgSwatch').attr('src');
        variationProduits.push(variationProduit);
      });

      return variationProduits;
    }
    return variationProduits;

  }

  private imagesProduct(contents: string): any {
    const imagesProduct: any[] = [];

    if (contents != null) {
      const $: CheerioStatic = ScraperHelper.getScript(contents, 'colorImages');
      if ($) {
        const html: string = $.root().html();

        html.match(ScraperHelper.regex).forEach((match) => {

          imagesProduct.push(match);
        });
        return imagesProduct;
      }

    }
    return [];
  }

}
