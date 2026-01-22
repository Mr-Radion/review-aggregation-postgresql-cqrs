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

      const stars = { stars1: 0, stars2: 0, stars3: 0, stars4: 0, stars5: 0 };
      let sum = 0;

      for (const r of reviews) {
        sum += r.rating;
        if (r.rating === 1) stars.stars1++;
        else if (r.rating === 2) stars.stars2++;
        else if (r.rating === 3) stars.stars3++;
        else if (r.rating === 4) stars.stars4++;
        else if (r.rating === 5) stars.stars5++;
      }

      const existing = await aggRepo.findOne({ where: { recipientId } });
      
      if (existing) {
        existing.reviewCount = reviews.length;
        existing.ratingSum = sum;
        existing.stars1 = stars.stars1;
        existing.stars2 = stars.stars2;
        existing.stars3 = stars.stars3;
        existing.stars4 = stars.stars4;
        existing.stars5 = stars.stars5;
        await aggRepo.save(existing);
      } else {
        const agg = aggRepo.create({
          recipientId,
          reviewCount: reviews.length,
          ratingSum: sum,
          ...stars,
        });
        await aggRepo.save(agg);
      }

      await this.cache.invalidate(recipientId);
      
      return { rebuilt: true, recipientId };
    });
  }
}
