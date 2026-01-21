import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'seller_review_agg_view',
  expression: (ds: DataSource) =>
    ds
      .createQueryBuilder()
      .select('a."recipientId"', 'recipientId')
      .addSelect('a."reviewCount"', 'reviewCount')
      .addSelect(
        `CASE 
           WHEN a."reviewCount" > 0 
           THEN ROUND((a."ratingSum"::numeric / a."reviewCount")::numeric, 2) 
           ELSE NULL 
         END`,
        'avgRating',
      )
      .addSelect('a."ratingDistribution"', 'ratingDistribution')
      .addSelect('a."updatedAt"', 'updatedAt')
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
  ratingDistribution: Record<string, number>;

  @ViewColumn()
  updatedAt: Date;
}
