import { SellerReviewAggView } from '../../review-aggregation/entities/seller-review-agg.view';
import { ReviewAggregateDto } from '../dto/review-aggregate.dto';

export class ReviewAggregateMapper {
  static toDto(view: SellerReviewAggView): ReviewAggregateDto {
    return {
      recipientId: view.recipientId,
      reviewCount: view.reviewCount,
      avgRating: view.avgRating ? Number(view.avgRating) : null,
      ratings: view.ratingDistribution ?? {},
      updatedAt: view.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }
}
