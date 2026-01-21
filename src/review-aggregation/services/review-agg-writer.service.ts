import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { SellerReviewAggEntity } from '../entities/seller-review-agg.entity';

@Injectable()
export class ReviewAggWriterService {
  private async getOrCreate(
    manager: EntityManager,
    recipientId: string,
  ): Promise<SellerReviewAggEntity> {
    const repo = manager.getRepository(SellerReviewAggEntity);

    let agg = await repo.findOne({
      where: { recipientId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!agg) {
      agg = repo.create({
        recipientId,
        reviewCount: 0,
        ratingSum: 0,
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      });
    }

    return agg;
  }

  async onCreate(
    manager: EntityManager,
    recipientId: string,
    rating: number,
  ) {
    const repo = manager.getRepository(SellerReviewAggEntity);
    const agg = await this.getOrCreate(manager, recipientId);

    agg.reviewCount += 1;
    agg.ratingSum += rating;
    const key = String(rating);
    agg.ratingDistribution[key] = (agg.ratingDistribution[key] ?? 0) + 1;

    await repo.save(agg);
  }

  async onRatingChange(
    manager: EntityManager,
    recipientId: string,
    oldRating: number,
    newRating: number,
  ) {
    const repo = manager.getRepository(SellerReviewAggEntity);
    const agg = await this.getOrCreate(manager, recipientId);

    agg.ratingSum += newRating - oldRating;

    const oldKey = String(oldRating);
    const newKey = String(newRating);
    agg.ratingDistribution[oldKey] = Math.max(
      0,
      (agg.ratingDistribution[oldKey] ?? 0) - 1,
    );
    agg.ratingDistribution[newKey] = (agg.ratingDistribution[newKey] ?? 0) + 1;

    await repo.save(agg);
  }

  async onDelete(
    manager: EntityManager,
    recipientId: string,
    rating: number,
  ) {
    const repo = manager.getRepository(SellerReviewAggEntity);
    const agg = await this.getOrCreate(manager, recipientId);

    agg.reviewCount = Math.max(0, agg.reviewCount - 1);
    agg.ratingSum = Math.max(0, agg.ratingSum - rating);
    const key = String(rating);
    agg.ratingDistribution[key] = Math.max(
      0,
      (agg.ratingDistribution[key] ?? 0) - 1,
    );

    await repo.save(agg);
  }
}
