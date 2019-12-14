import { ProductDetail } from './productDetail';
import { Observable } from 'rxjs';
// tslint:disable-next-line:variable-name
export class Product {


  private _asin: string;
  private _title: string;
  private _image: string;
  private _link: string;
  private _reviews: string;
  private _shipping: string;
  private _images: string[];
  private _productDetail: Observable<ProductDetail>;

  get asin(): string {
    return this._asin;
  }

  set asin(value: string) {
    this._asin = value;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get image(): string {
    return this._image;
  }

  set image(value: string) {
    this._image = value;
  }

  get link(): string {
    return this._link;
  }

  set link(value: string) {
    this._link = value;
  }

  get reviews(): string {
    return this._reviews;
  }

  set reviews(value: string) {
    this._reviews = value;
  }

  get shipping(): string {
    return this._shipping;
  }

  set shipping(value: string) {
    this._shipping = value;
  }

  get images(): string[] {
    return this._images;
  }

  set images(value: string[]) {
    this._images = value;
  }

  get productDetail(): Observable<ProductDetail> {
    return this._productDetail;
  }

  set productDetail(value: Observable<ProductDetail>) {
    this._productDetail = value;
  }
}
