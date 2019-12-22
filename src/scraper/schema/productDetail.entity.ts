import { BaseEntity, Column, CreateDateColumn, Entity, Index, ObjectID, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ProductDetailEntity extends BaseEntity {

  @ObjectIdColumn()
  _id: ObjectID;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt?: Date;
  @Column()
  manufacturer: string;
  @Column()
  productTitle: string;
  @Column()
  customerRatings: string;
  @Column()
  answeredQuestions: string;
  @Column('number')
  crossedPrice: number;
  @Column()
  link: string;
  @Column('number')
  price: number;
  @Column('number')
  price01: number;
  @Column('number')
  price02: number;
  @Column('number')
  priceMin: number;
  @Column('number')
  priceMax: number;
  @Column()
  images: string[];
  @Column()
  linkReviews: string;
}
