import { SellerReviewAggView } from '../../review-aggregation/entities/seller-review-agg.view';
import { ReviewAggregateDto } from '../dto/review-aggregate.dto';

export class ReviewAggregateMapper {
  static toDto(view: SellerReviewAggView): ReviewAggregateDto {
    return {
      recipientId: view.recipientId,
      reviewCount: view.reviewCount,
      avgRating: view.avgRating ? Number(view.avgRating) : null,
      ratings: {
        '1': view.stars1 ?? 0,
        '2': view.stars2 ?? 0,
        '3': view.stars3 ?? 0,
        '4': view.stars4 ?? 0,
        '5': view.stars5 ?? 0,
      },
      updatedAt: view.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }
}
