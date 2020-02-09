import { Injectable } from '@nestjs/common';
import { Logger } from '../../shared/logger/logger.decorator';
import { ScraperLoggerService } from '../../shared/logger/loggerService';
import { ConfigService } from '@nestjs/config';
import { from, merge, Observable } from 'rxjs';
import { Merchantwords } from '../product/merchantwords';
import { InjectModel } from 'nestjs-typegoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { MerchantwordsEntity } from './merchantwords.entity';
import { classToClass, classToClassFromExist, classToPlain, plainToClass } from 'class-transformer';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { ProductEntity } from './product.entity';
import { isNil } from '../../shared/utils/shared.utils';

@Injectable()
export class MerchantwordsRepository {
  constructor(
    @Logger({
      context: 'scraperMicroService',
      prefix: 'productRepository',
    }) private logger: ScraperLoggerService,
    private readonly configService: ConfigService,
    @InjectModel(MerchantwordsEntity) private readonly merchantwordsEntityModel: ReturnModelType<typeof MerchantwordsEntity>,
  ) {

  }

  public saveMerchantword(merchantwords: Merchantwords): Observable<any> {
    this.logger.debug(`searchWord in :${merchantwords.wordsSearch}`);
    const serializedMerchantwords = classToPlain(merchantwords);
    const merchantwordsEntity: MerchantwordsEntity = plainToClass(MerchantwordsEntity, serializedMerchantwords);
    const merchantwordsModel = new this.merchantwordsEntityModel(merchantwordsEntity);

    const source$ = from(this.merchantwordsEntityModel.findOne({
      wordsSearch: merchantwords.wordsSearch,
    }));
    const save$ = source$.pipe(
      filter((merchantwordsEntity$: DocumentType<MerchantwordsEntity>) => isNil(merchantwordsEntity$)),
      tap((merchantwordsEntity$: DocumentType<MerchantwordsEntity>) => {
        this.logger.log(`save merchantwordsEntity$ : id :[${merchantwordsModel.id}] wordsSearch :[${merchantwordsModel.wordsSearch}] `);
      }),
      mergeMap((merchantwordsEntity$: DocumentType<MerchantwordsEntity>) => from(merchantwordsModel.save())),
    );

    const update$ = source$.pipe(

      filter((merchantwordsEntity$: DocumentType<MerchantwordsEntity>) => {
        return !isNil(merchantwordsEntity$) && merchantwordsEntity$.vollume.toString() !== merchantwordsEntity.vollume.toString();
      }),
      mergeMap((merchantwordsEntity$: DocumentType<MerchantwordsEntity>) => from(this.merchantwordsEntityModel.findByIdAndUpdate(merchantwordsEntity$.id, merchantwordsEntity))),
      tap((merchantwordsEntity$: DocumentType<MerchantwordsEntity>) => {
        this.logger.log(`update merchantwordsEntity$ : id :[${merchantwordsEntity$.id}] wordsSearch :[${merchantwordsEntity$.wordsSearch}] `);
      }),
    );
    const saveOrUpdate$ = merge(
      save$,
      update$,
    );
    return saveOrUpdate$;
  }

  public getAllMerchantwords(site: string): Observable<Merchantwords> {

    return from(this.merchantwordsEntityModel.find({
        site,
      }).limit(parseInt(this.configService.get('MERCHANTWORDS_LIMIT'))).sort({ vollume: -1 }),
    ).pipe(
      mergeMap((merchantwordsEntitys$: MerchantwordsEntity[]) => {
        return from(merchantwordsEntitys$).pipe(map((merchantwordsEntity$: DocumentType<MerchantwordsEntity>) => {
          const merchantwordsEntity: MerchantwordsEntity = plainToClass(MerchantwordsEntity, merchantwordsEntity$.toObject());
          return classToPlain(merchantwordsEntity, { strategy: 'excludeAll' }) as Merchantwords;
        }));
      }),
    );
  }
}
