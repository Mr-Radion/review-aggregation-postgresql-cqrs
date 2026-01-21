import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  Check,
} from 'typeorm';

export type RatingDistribution = Record<string, number>; // keys: "1".."5"

@Entity('seller_review_agg')
@Check(`"reviewCount" >= 0`)
@Check(`"ratingSum" >= 0`)
export class SellerReviewAggEntity {
  @PrimaryColumn('uuid')
  recipientId: string;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'int', default: 0 })
  ratingSum: number;

  @Column({
    type: 'jsonb',
    default: () => `'{"1":0,"2":0,"3":0,"4":0,"5":0}'`,
  })
  ratingDistribution: RatingDistribution;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
