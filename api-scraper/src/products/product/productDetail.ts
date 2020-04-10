import { ChildProduct } from './childProduct';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ApiValidator } from '../../shared/utils/shared.utils';
import { IsNotEmpty, validate } from 'class-validator';
import { ProductReviews } from './productReviews';
import { ApiProperty } from '@nestjs/swagger';

export class ProductDetail {
  @Exclude()
  private _manufacturer: string;
  @Exclude()
  private _productTitle: string;
  @Exclude()
  private _customerRatings: string;
  @Exclude()
  private _answeredQuestions: string;
  @Exclude()
  private _crossedprice: string;
  @Exclude()
  private _link: string;
  @Exclude()
  private _price: string;
  @Exclude()
  private _price01: string;
  @Exclude()
  private _price02: string;
  @Exclude()
  private _priceMin: string;
  @Exclude()
  private _priceMax: string;
  @Exclude()
  private _images: string[];
  @Exclude()
  private _childProduct: ChildProduct[];

  @Exclude()
  _sourceHtml: string;
  @Exclude()
  private _isCaptcha: boolean;
  @Exclude()
  private _categorys: string[];
  @Exclude()
  private _descriptions: string[];
  @Exclude()
  private _linkReviews: string;
  @Exclude()
  private _rating: string;
  @Exclude()
  private _productReviews: ProductReviews;

  @Expose()
  @ApiProperty()
  get productReviews(): ProductReviews {
    return this._productReviews;
  }

  set productReviews(value: ProductReviews) {
    this._productReviews = value;
  }

  @Expose()
  @ApiProperty()
  @Transform(value => parseFloat(value) ? parseFloat(value) : null)
  get rating(): string {
    return this._rating;
  }

  set rating(value: string) {
    this._rating = value;
  }

  @Expose()
  @ApiProperty()
  get linkReviews(): string {
    return this._linkReviews;
  }

  set linkReviews(value: string) {
    this._linkReviews = value;
  }

  @Expose()
  @ApiProperty()
  get categorys(): string[] {
    return this._categorys;
  }

  set categorys(value: string[]) {

    this._categorys = value;
  }

  @Expose()
  @ApiProperty()
  get descriptions(): string[] {
    return this._descriptions;
  }

  set descriptions(value: string[]) {

    this._descriptions = value;
  }

  @Exclude()
  get isCaptcha(): boolean {
    return this._isCaptcha;
  }

  set isCaptcha(value: boolean) {
    this._isCaptcha = value;
  }

  @Expose()
  @ApiProperty()
  get link(): string {
    return this._link;
  }

  set link(value: string) {
    this._link = value;
  }


  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  get manufacturer(): string {
    return this._manufacturer;
  }

  set manufacturer(value: string) {
    this._manufacturer = value;
  }

  @Expose()
  @ApiProperty()
  get productTitle(): string {
    return this._productTitle;
  }

  set productTitle(value: string) {
    this._productTitle = value;
  }

  @Expose()
  @ApiProperty()
  get customerRatings(): string {
    return this._customerRatings;
  }

  set customerRatings(value: string) {
    this._customerRatings = value;
  }

  @Expose()
  @ApiProperty()
  get answeredQuestions(): string {
    return this._answeredQuestions;
  }

  set answeredQuestions(value: string) {
    this._answeredQuestions = value;
  }

  @Expose()
  @ApiProperty()
  get crossedprice(): string {
    return this._crossedprice;
  }

  set crossedprice(value: string) {
    this._crossedprice = value;
  }

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  get price(): string {
    if (ApiValidator.isEmpty(this._price)) {
      this._price = this.priceMin;
    }
    return this._price;
  }

  set price(value: string) {
    this._price = value;
  }

  @Expose()
  @ApiProperty()
  get price01(): string {
    return this._price01;
  }

  set price01(value: string) {
    this._price01 = value;
  }

  @Expose()
  @ApiProperty()
  get price02(): string {
    return this._price02;
  }

  set price02(value: string) {
    this._price02 = value;
  }

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(value => parseFloat(value) ? parseFloat(value) : null)
  get priceMin(): string {
    if (ApiValidator.isNotEmpty(this._price) && this._price.split('-').length > 0) {
      const priceMin = this._price.split('-')[0].replace('$', '');
      this._priceMin = priceMin;
    } else if (ApiValidator.isNotEmpty(this.price01)) {
      this._priceMin = this.price01;

    } else if (ApiValidator.isNotEmpty(this.price02)) {
      this._priceMin = this.price02;

    }
    return this._priceMin;
  }

  set priceMin(value: string) {
    this._priceMin = value;
  }

  @Expose()
  @ApiProperty()
  @Transform(value => parseFloat(value) ? parseFloat(value) : null)
  get priceMax(): string {
    if (ApiValidator.isNotEmpty(this.price) && this.price.split('-').length > 1) {
      const priceMax = this.price.split('-')[1].replace('$', '');
      this._priceMax = priceMax;
    }

    return this._priceMax;
  }

  set priceMax(value: string) {
    this._priceMax = value;
  }

  @Expose()
  @ApiProperty()
  get images(): string[] {
    return this._images;
  }

  set images(value: string[]) {
    this._images = value;
  }

  @Expose()
  @ApiProperty()
  @Type(() => ChildProduct)
  get childProduct(): ChildProduct[] {
    return this._childProduct;
  }

  set childProduct(value: ChildProduct[]) {
    this._childProduct = value;
  }


  @Exclude()
  get sourceHtml(): string {
    return this._sourceHtml;
  }

  set sourceHtml(value: string) {
    this._sourceHtml = value;
  }

  async isValideProduct(): Promise<boolean> {
    //validate(this).then(console.log);

    return (await validate(this)).length > 0 ? false : true;
  }

}
