import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ObjectID, ObjectIdColumn, OneToOne, UpdateDateColumn } from 'typeorm';
import { ProductDetail } from '../product/productDetail';
import { ProductDetailEntity } from './productDetail.entity';

@Entity()
export class ProductEntity extends BaseEntity {

  @ObjectIdColumn()
  _id: ObjectID;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt?: Date;
  @Column()
  @Index()
  asin: string;
  @Column()
  @Index()
  searchWord: string;
  @Column()
  currency: string;
  @Column()
  @Index()
  manufacturer: string;
  @Column()
  title: string;
  @Column()
  image: string;
  @Column()
  link: string;
  @Column('number')
  reviews: number;
  @Column('number')
  price: number;
  @Column()
  shipping: string;
  @Column('array')
  images: string[];
  @Column('array')
  category: string[];

  @OneToOne(type => ProductDetailEntity, {
    cascade: true,
    lazy: true,

  })
  @JoinColumn()
  productDetail: ProductDetailEntity;

}
