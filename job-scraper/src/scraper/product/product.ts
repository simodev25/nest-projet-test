import { ProductDetail } from './productDetail';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsUrl, validate } from 'class-validator';
import { validator } from '../../shared/utils/shared.utils';
import { IimageProduct } from './product.interface';

// tslint:disable-next-line:variable-name
export class Product {

  @Exclude()
  private _baseUrl: string;
  @Exclude()
  private _country: string;
  @Exclude()
  private _currency: string;
  @Exclude()
  private _site: string;
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
  private _images: IimageProduct[];

  @Exclude()
  private _categorys: string[] = [];
  @Exclude()
  private _productDetail: ProductDetail;
  @Exclude()
  private _rating: string;

  @Expose()
  get categorys(): string[] {

    return (this._productDetail ? this._productDetail.categorys : this._categorys);
  }

  set categorys(value: string[]) {
    this._categorys = value;
  }

  set category(value: string) {
    this._categorys.push(value);
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

  @Expose()
  @IsNotEmpty()
  get site(): string {
    return this._site;
  }

  set site(value: string) {
    this._site = value;
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
    return this._searchWord || this.title;
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
  @Transform(value => parseFloat(value) ? parseFloat(value) : null)
  get reviews(): string {
    return this._reviews || this.productDetail?.productReviews?.reviews;
  }

  set reviews(value: string) {
    this._reviews = value;
  }

  @Expose()
  @Transform(value => parseFloat(value) ? parseFloat(value) : null)
  get rating(): string {
    return this._rating || this.productDetail?.productReviews?.rating;
  }

  set rating(rating: string) {
    this._rating = rating;
  }

  @Expose()
  get shipping(): string {
    return this._shipping;
  }

  set shipping(value: string) {
    this._shipping = value;
  }

  @Expose()
  @Transform(value => value)
  get images(): IimageProduct[] {
    return this._images;
  }

  set images(value: IimageProduct[]) {
    this._images = value;
  }

  @Expose()
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
