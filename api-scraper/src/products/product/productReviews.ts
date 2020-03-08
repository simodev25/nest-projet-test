import { Exclude, Expose } from 'class-transformer';
import { RatingProduct, ReviewProduct } from './product.interface';
import { ApiProperty } from '@nestjs/swagger';
@Exclude()
export class ProductReviews {

  @Exclude()
  private _reviews: string;
  @Exclude()
  private _rating: string;
  @Exclude()
  private _ratings: RatingProduct[];
  @Exclude()
  private _topCritical: ReviewProduct;
  @Exclude()
  private _topPositive: ReviewProduct;
  @Exclude()
  private _reviewsContent: ReviewProduct[];
  @Expose()
  get reviews(): string {
    return this._reviews;
  }

  set reviews(value: string) {
    this._reviews = value;
  }
  @Expose()
  @ApiProperty()
  get rating(): string {
    return this._rating;
  }

  set rating(value: string) {
    this._rating = value;
  }
  @Expose()
  @ApiProperty()
  get ratings(): RatingProduct[] {
    return this._ratings;
  }

  set ratings(value: RatingProduct[]) {
    this._ratings = value;
  }
  @Expose()
  @ApiProperty()
  get topCritical(): ReviewProduct {
    return this._topCritical;
  }

  set topCritical(value: ReviewProduct) {
    this._topCritical = value;
  }
  @Expose()
  @ApiProperty()
  get topPositive(): ReviewProduct {
    return this._topPositive;
  }

  set topPositive(value: ReviewProduct) {
    this._topPositive = value;
  }
  @Expose()
  @ApiProperty()
  get reviewsContent(): ReviewProduct[] {
    return this._reviewsContent;
  }

  set reviewsContent(value: ReviewProduct[]) {
    this._reviewsContent = value;
  }
}
