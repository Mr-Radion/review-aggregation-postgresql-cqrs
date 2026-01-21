import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetSellerAggregateQuery } from '../get-seller-aggregate.query';
import { SellerReviewAggView } from '../../../../review-aggregation/entities/seller-review-agg.view';
import { ReviewAggCacheService } from '../../../../review-aggregation/services/review-agg-cache.service';
import { ReviewAggregateMapper } from '../../../mappers/review-aggregate.mapper';
import { ReviewAggregateDto } from '../../../dto/review-aggregate.dto';

@QueryHandler(GetSellerAggregateQuery)
export class GetSellerAggregateHandler implements IQueryHandler<GetSellerAggregateQuery> {
  constructor(
    @InjectRepository(SellerReviewAggView)
    private readonly viewRepo: Repository<SellerReviewAggView>,
    private readonly cache: ReviewAggCacheService,
  ) {}

  async execute(q: GetSellerAggregateQuery): Promise<ReviewAggregateDto> {
    const cached = await this.cache.get<ReviewAggregateDto>(q.recipientId);
    if (cached) return cached;

    const view = await this.viewRepo.findOne({ where: { recipientId: q.recipientId } });

    const dto = view
      ? ReviewAggregateMapper.toDto(view)
      : {
          recipientId: q.recipientId,
          reviewCount: 0,
          avgRating: null,
          ratings: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          updatedAt: new Date().toISOString(),
        };

    await this.cache.set(q.recipientId, dto, 60);
    return dto;
  }
}
