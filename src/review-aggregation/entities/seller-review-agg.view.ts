import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'seller_review_agg_view',
  expression: (ds: DataSource) =>
    ds
      .createQueryBuilder()
      .select('a."recipient_id"', 'recipientId')
      .addSelect('a."review_count"', 'reviewCount')
      .addSelect(
        `CASE 
           WHEN a."review_count" > 0 
           THEN ROUND((a."rating_sum"::numeric / a."review_count")::numeric, 2) 
           ELSE NULL 
         END`,
        'avgRating',
      )
      .addSelect('a."stars_1"', 'stars1')
      .addSelect('a."stars_2"', 'stars2')
      .addSelect('a."stars_3"', 'stars3')
      .addSelect('a."stars_4"', 'stars4')
      .addSelect('a."stars_5"', 'stars5')
      .addSelect('a."updated_at"', 'updatedAt')
      .from('seller_review_agg', 'a'),
})
export class SellerReviewAggView {
  @ViewColumn()
  recipientId: string;

  @ViewColumn()
  reviewCount: number;

  @ViewColumn()
  avgRating: string | null;

  @ViewColumn()
  stars1: number;

  @ViewColumn()
  stars2: number;

  @ViewColumn()
  stars3: number;

  @ViewColumn()
  stars4: number;

  @ViewColumn()
  stars5: number;

  @ViewColumn()
  updatedAt: Date;
}
