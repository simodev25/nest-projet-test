import { ChildProduct } from './childProduct';

export class ProductDetail {
  private _sourceHtml: string;
  private _manufacturer: string;
  private _productTitle: string;
  private _customerRatings: string;
  private _answeredQuestions: string;
  private _crossedprice: string;
  private _price: string;
  private _price01: string;
  private _price02: string;
  private _priceMin: string;
  private _priceMax: string;
  private _images: string[];
  private _childProduct: ChildProduct[];

  get sourceHtml(): string {
    return this._sourceHtml;
  }

  set sourceHtml(value: string) {
    this._sourceHtml = value;
  }

  get manufacturer(): string {
    return this._manufacturer;
  }

  set manufacturer(value: string) {
    this._manufacturer = value;
  }

  get productTitle(): string {
    return this._productTitle;
  }

  set productTitle(value: string) {
    this._productTitle = value;
  }

  get customerRatings(): string {
    return this._customerRatings;
  }

  set customerRatings(value: string) {
    this._customerRatings = value;
  }

  get answeredQuestions(): string {
    return this._answeredQuestions;
  }

  set answeredQuestions(value: string) {
    this._answeredQuestions = value;
  }

  get crossedprice(): string {
    return this._crossedprice;
  }

  set crossedprice(value: string) {
    this._crossedprice = value;
  }

  get price(): string {
    return this._price;
  }

  set price(value: string) {
    this._price = value;
  }

  get price01(): string {
    return this._price01;
  }

  set price01(value: string) {
    this._price01 = value;
  }

  get price02(): string {
    return this._price02;
  }

  set price02(value: string) {
    this._price02 = value;
  }

  get priceMin(): string {
    return this._priceMin;
  }

  set priceMin(value: string) {
    this._priceMin = value;
  }

  get priceMax(): string {
    return this._priceMax;
  }

  set priceMax(value: string) {
    this._priceMax = value;
  }

  get images(): string[] {
    return this._images;
  }

  set images(value: string[]) {
    this._images = value;
  }

  get childProduct(): ChildProduct[] {
    return this._childProduct;
  }

  set childProduct(value: ChildProduct[]) {
    this._childProduct = value;
  }


}
