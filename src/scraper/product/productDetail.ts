import { ChildProduct } from './childProduct';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { validator } from '../../shared/utils/shared.utils';
import { IsNotEmpty, validate } from 'class-validator';
import { Column } from 'typeorm';
import { ProductReviews } from './productReviews';
@Exclude()
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
  private _sourceHtml: string;

  @Exclude()
  private _isCaptcha: boolean;
  @Exclude()
  private _category: string[];
  @Exclude()
  private _linkReviews: string;
  @Exclude()
  private _rating: string;
  @Exclude()
  private _productReviews: ProductReviews;
  @Exclude()
  get productReviews(): ProductReviews {
    return this._productReviews;
  }

  set productReviews(value: ProductReviews) {
    this._productReviews = value;
  }

  @Expose()
  @Transform(value => parseFloat(value) ? parseFloat(value) : null)
  get rating(): string {
    return this._rating;
  }

  set rating(value: string) {
    this._rating = value;
  }

  @Expose()
  get linkReviews(): string {
    return this._linkReviews;
  }

  set linkReviews(value: string) {
    this._linkReviews = value;
  }

  @Expose()
  get category(): string[] {
    return this._category;
  }

  set category(value: string[]) {

    this._category = value;
  }

  @Exclude()
  get isCaptcha(): boolean {
    return this._isCaptcha;
  }

  set isCaptcha(value: boolean) {
    this._isCaptcha = value;
  }

  @Exclude()
  get sourceHtml(): string {
    return this._sourceHtml;
  }

  @Expose()
  get link(): string {
    return this._link;
  }

  set link(value: string) {
    this._link = value;
  }

  set sourceHtml(value: string) {
    this._sourceHtml = value;
  }

  @Expose()
  @IsNotEmpty()
  get manufacturer(): string {
    return this._manufacturer;
  }

  set manufacturer(value: string) {
    this._manufacturer = value;
  }

  @Expose()
  get productTitle(): string {
    return this._productTitle;
  }

  set productTitle(value: string) {
    this._productTitle = value;
  }

  @Expose()
  get customerRatings(): string {
    return this._customerRatings;
  }

  set customerRatings(value: string) {
    this._customerRatings = value;
  }

  @Expose()
  get answeredQuestions(): string {
    return this._answeredQuestions;
  }

  set answeredQuestions(value: string) {
    this._answeredQuestions = value;
  }

  @Expose()
  get crossedprice(): string {
    return this._crossedprice;
  }

  set crossedprice(value: string) {
    this._crossedprice = value;
  }

  @Expose()
  @IsNotEmpty()
  get price(): string {
    if (validator.isEmpty(this._price)) {
      this._price = this.priceMin;
    }
    return this._price;
  }

  set price(value: string) {
    this._price = value;
  }

  @Expose()
  get price01(): string {
    return this._price01;
  }

  set price01(value: string) {
    this._price01 = value;
  }

  @Expose()
  get price02(): string {
    return this._price02;
  }

  set price02(value: string) {
    this._price02 = value;
  }

  @Expose()
  @IsNotEmpty()
  @Transform(value => parseFloat(value) ? parseFloat(value) : null)
  get priceMin(): string {
    if (validator.isNotEmpty(this._price) && this._price.split('-').length > 0) {
      const priceMin = this._price.split('-')[0].replace('$', '');
      this._priceMin = priceMin;
    } else if (validator.isNotEmpty(this.price01)) {
      this._priceMin = this.price01;

    } else if (validator.isNotEmpty(this.price02)) {
      this._priceMin = this.price02;

    }
    return this._priceMin;
  }

  set priceMin(value: string) {
    this._priceMin = value;
  }

  @Expose()
  @Transform(value => parseFloat(value) ? parseFloat(value) : null)
  get priceMax(): string {
    if (validator.isNotEmpty(this.price) && this.price.split('-').length > 1) {
      const priceMax = this.price.split('-')[1].replace('$', '');
      this._priceMax = priceMax;
    }

    return this._priceMax;
  }

  set priceMax(value: string) {
    this._priceMax = value;
  }

  @Expose()
  get images(): string[] {
    return this._images;
  }

  set images(value: string[]) {
    this._images = value;
  }

  @Expose()
  get childProduct(): ChildProduct[] {
    return this._childProduct;
  }

  set childProduct(value: ChildProduct[]) {
    this._childProduct = value;
  }

  async isValideProduct(): Promise<boolean> {
    //validate(this).then(console.log);

    return (await validate(this)).length > 0 ? false : true;
  }

}
