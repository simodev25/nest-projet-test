import { Exclude } from 'class-transformer';
import { IimageProduct } from './product.interface';
import { ProductDetail } from './productDetail';

export interface IProduct {



  title: string;

  price: number;

  image: string;

  link: string;

  reviews: string;

  shipping: string;

  category: string[];

}
