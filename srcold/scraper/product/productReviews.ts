import { Exclude, Expose } from 'class-transformer';
import { IratingProduct, IreviewProduct } from './product.interface';
@Exclude()
export class ProductReviews {

  @Exclude()
  private _reviews: string;
  @Exclude()
  private _rating: string;
  @Exclude()
  private _ratings: IratingProduct[];
  @Exclude()
  private _topCritical: IreviewProduct;
  @Exclude()
  private _topPositive: IreviewProduct;
  @Exclude()
  private _reviewsContent: IreviewProduct[];
  @Expose()
  get reviews(): string {
    return this._reviews;
  }

  set reviews(value: string) {
    this._reviews = value;
  }
  @Expose()
  get rating(): string {
    return this._rating;
  }

  set rating(value: string) {
    this._rating = value;
  }
  @Expose()
  get ratings(): IratingProduct[] {
    return this._ratings;
  }

  set ratings(value: IratingProduct[]) {
    this._ratings = value;
  }
  @Expose()
  get topCritical(): IreviewProduct {
    return this._topCritical;
  }

  set topCritical(value: IreviewProduct) {
    this._topCritical = value;
  }
  @Expose()
  get topPositive(): IreviewProduct {
    return this._topPositive;
  }

  set topPositive(value: IreviewProduct) {
    this._topPositive = value;
  }
  @Expose()
  get reviewsContent(): IreviewProduct[] {
    return this._reviewsContent;
  }

  set reviewsContent(value: IreviewProduct[]) {
    this._reviewsContent = value;
  }
}
