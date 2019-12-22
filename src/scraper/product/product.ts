import { ProductDetail } from './productDetail';
import { Observable } from 'rxjs';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsNumberString, IsUrl, validate } from 'class-validator';
import { validator, isNil, getValueFromParameters } from '../../shared/utils/shared.utils';

// tslint:disable-next-line:variable-name
export class Product {

  @Exclude()
  private _baseUrl: string;
  @Exclude()
  private _country: string;
  @Exclude()
  private _currency: string;
  @Exclude()
  private _asin: string;
  @Exclude()
  private _searchWord: string;
  @Exclude()
  private _title: string;
  @Exclude()
  private _price: string;
  @Exclude()
  private _image: string;
  @Exclude()
  private _link: string;
  @Exclude()
  private _reviews: string;
  @Exclude()
  private _shipping: string;
  @Exclude()
  private _images: string[];

  @Exclude()
  private _category: string[];
  @Exclude()
  private _productDetail: ProductDetail;


  @Expose()
  //@IsNotEmpty()
  get category(): string[] {
    return  (this._productDetail ? this._productDetail.category : null);
  }

  set category(value: string[]) {
    this._category = value;
  }

  @Expose()
  @IsNotEmpty()
  get baseUrl(): string {
    return this._baseUrl;
  }
  @Expose()
  @IsNotEmpty()
  get currency(): string {
    return this._currency;
  }

  set currency(value: string) {
    this._currency = value;
  }

  set baseUrl(value: string) {
    this._baseUrl = value;
  }

  @Expose()
  @IsNotEmpty()
  get country(): string {
    return this._country;
  }

  set country(value: string) {
    this._country = value;
  }

  @Expose()
  @IsNotEmpty()
  get searchWord(): string {
    return this._searchWord;
  }

  set searchWord(value: string) {
    this._searchWord = value;
  }

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  @Transform(value => parseFloat(value))
  get price(): string {

    return this._price || (this._productDetail ? this._productDetail.priceMin : this._price);
  }

  set price(value: string) {
    this._price = value;
  }

  @Expose()
  @IsNotEmpty()
  get asin(): string {
    return this._asin;
  }

  set asin(value: string) {
    this._asin = value;
  }

  @Expose()
  get manufacturer(): string {
    if (validator.isNotEmpty(this._productDetail)) {
      return this._productDetail.manufacturer;
    }
    return null;
  }

  @Expose()
  @IsNotEmpty()
  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  @Expose()
  get image(): string {
    return this._image;
  }

  set image(value: string) {
    this._image = value;
  }

  @Expose()
  @IsNotEmpty()
  @IsUrl()
  get link(): string {
    return this._link;
  }

  set link(value: string) {
    this._link = value;
  }

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  @Transform(value => parseInt(value, 10))
  get reviews(): string {
    return this._reviews;
  }

  set reviews(value: string) {
    this._reviews = value;
  }

  @Expose()
  get shipping(): string {
    return this._shipping;
  }

  set shipping(value: string) {
    this._shipping = value;
  }

  @Expose()
  get images(): string[] {
    return this._images;
  }

  set images(value: string[]) {
    this._images = value;
  }

  // @Transform(value => value)
  //@Expose()
  @Type(() => ProductDetail)
  get productDetail(): ProductDetail {
    return this._productDetail;
  }



  set productDetail(value: ProductDetail) {
    this._productDetail = value;
  }

  async isValideProduct(): Promise<boolean> {
   //  validate(this).then(console.log)

    return (await validate(this)).length > 0 ? false : true;
  }
}
