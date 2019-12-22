import { Injectable } from '@nestjs/common';
import { filter, map, mapTo, mergeMap, retryWhen } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { ScraperAmazoneService } from './lib/scraperAmazone.service';
import { RxjsUtils } from './rxjs-utils';
import { plainToClass } from 'class-transformer';

import { ProductDetail } from './product/productDetail';
import { ScraperHelper } from './ScraperHelper';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product/product';
import { ProductRepository } from './schema/product.repository';
import { ProductDetailRepository } from './schema/productDetail.repository';

@Injectable()
export class ScraperService {
  constructor(@InjectRepository(ProductRepository) private readonly productRepository: ProductRepository,
              @InjectRepository(ProductDetailRepository) private readonly productDetailRepository: ProductDetailRepository,
              private readonly scraperAmazone: ScraperAmazoneService) {

  }

  public scrapeAmazoneFr() {



  }

  public scrapeAmazoneSearchWord(searchWord: string): Observable<number> {
    let productCount: number = 0;
    const country: string = 'US';
    const baseUrlAmazone: string = ScraperHelper.getBaseUrlAmazone(country);

    const scrapeAmazoneSearchWord = this.scraperAmazone.scrapeUrlHome(`${baseUrlAmazone}s?k=${searchWord.replace(/\\s/g, '+').trim()}`).pipe(
      retryWhen(RxjsUtils.genericRetryStrategy({
        scalingDuration: 2000,
        excludedStatusCodes: [500],
      })),
      mergeMap(produit => from(produit)),
      map(produit => {
        //  console.log(produit);
        const produitClass: Product = plainToClass(Product, produit);
        produitClass.searchWord = searchWord;
        produitClass.baseUrl = baseUrlAmazone;
        produitClass.country = country;
        produitClass.currency = ScraperHelper.getCurrency(country);
        return produitClass;
      }),
      mergeMap((produitClass: Product) => from(produitClass.isValideProduct()).pipe(
        filter(Boolean),
        mapTo(produitClass),
      )),
      mergeMap((produitClass: Product) => {

        return this.scraperAmazone.productDetail(produitClass.link,baseUrlAmazone).pipe(
          map((productDetail) => plainToClass(ProductDetail, productDetail)),
          mergeMap((productDetail: ProductDetail) => from(productDetail.isValideProduct()).pipe(
            filter(Boolean),
            mapTo(productDetail),
          )),
          map((productDetail: ProductDetail) => {
            produitClass.productDetail = productDetail;
            return produitClass;
          }),
        );

      }),
      map((produitClass: Product) => {
        productCount++;
        // console.log(produitClass)
        this.productRepository.saveProduct(produitClass);
        return productCount;
      }),
    );

    return scrapeAmazoneSearchWord;
  }

}
