import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReviewEntity } from '../../reviews/entities/review.entity';
import { SellerReviewAggEntity } from '../entities/seller-review-agg.entity';
import { ReviewAggCacheService } from './review-agg-cache.service';

@Injectable()
export class ReviewAggSyncService {
  constructor(
    private readonly ds: DataSource,
    private readonly cache: ReviewAggCacheService,
  ) {}

  async rebuildAll(): Promise<{ rebuilt: true }> {
    const reviewsRepo = this.ds.getRepository(ReviewEntity);
    const uniqueRecipients = await reviewsRepo
      .createQueryBuilder('r')
      .select('DISTINCT r.recipientId', 'recipientId')
      .getRawMany();

    const recipientIds = uniqueRecipients.map((r) => r.recipientId);

    for (const recipientId of recipientIds) {
      await this.rebuildOne(recipientId);
    }

    return { rebuilt: true };
  }

  async rebuildOne(recipientId: string): Promise<{ rebuilt: true; recipientId: string }> {
    return this.ds.transaction(async (manager) => {
      const reviewsRepo = manager.getRepository(ReviewEntity);
      const aggRepo = manager.getRepository(SellerReviewAggEntity);

      const reviews = await reviewsRepo.find({
        where: { recipientId },
        select: ['rating'],
      });

      const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      let sum = 0;

      for (const r of reviews) {
        const key = String(r.rating);
        distribution[key]++;
        sum += r.rating;
      }

      const existing = await aggRepo.findOne({ where: { recipientId } });
      
      if (existing) {
        existing.reviewCount = reviews.length;
        existing.ratingSum = sum;
        existing.ratingDistribution = distribution;
        await aggRepo.save(existing);
      } else {
        const agg = aggRepo.create({
          recipientId,
          reviewCount: reviews.length,
          ratingSum: sum,
          ratingDistribution: distribution,
        });
        await aggRepo.save(agg);
      }

      await this.cache.invalidate(recipientId);
      
      return { rebuilt: true, recipientId };
    });
  }
}
