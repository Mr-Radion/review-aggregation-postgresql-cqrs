import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  Check,
} from 'typeorm';

@Entity({ name: 'seller_review_agg' })
@Check(`"reviewCount" >= 0`)
@Check(`"ratingSum" >= 0`)
export class SellerReviewAggEntity {
  @PrimaryColumn('uuid', { name: 'recipient_id' })
  recipientId: string;

  @Column('int', { name: 'review_count', default: 0 })
  reviewCount: number;

  @Column('int', { name: 'rating_sum', default: 0 })
  ratingSum: number;

  @Column('int', { name: 'stars_1', default: 0 })
  stars1: number;

  @Column('int', { name: 'stars_2', default: 0 })
  stars2: number;

  @Column('int', { name: 'stars_3', default: 0 })
  stars3: number;

  @Column('int', { name: 'stars_4', default: 0 })
  stars4: number;

  @Column('int', { name: 'stars_5', default: 0 })
  stars5: number;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
