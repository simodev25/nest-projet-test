import { ProductDetail } from './productDetail';
import { IimageProduct } from './product.interface';

export class Product {

  baseUrl: string;

  country: string;

  currency: string;

  site: string;

  asin: string;

  searchWord: string;

  title: string;

  price: string;

  image: string;

  link: string;

  reviews: string;

  shipping: string;

  images: IimageProduct[];

  categorys: string[] ;

  productDetail: ProductDetail;

  rating: string;


}
