import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { SellerReviewAggEntity } from '../entities/seller-review-agg.entity';

@Injectable()
export class ReviewAggWriterService {
  private assertRating(rating: number) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error(`Invalid rating: ${rating}`);
    }
  }

  private starsDelta(rating: number, delta: number) {
    return {
      stars1: rating === 1 ? delta : 0,
      stars2: rating === 2 ? delta : 0,
      stars3: rating === 3 ? delta : 0,
      stars4: rating === 4 ? delta : 0,
      stars5: rating === 5 ? delta : 0,
    };
  }

  /**
   * Атомарный UPSERT через PostgreSQL ON CONFLICT.
   * Защита от race condition: при одновременных запросах PostgreSQL сериализует конфликты,
   * все дельты прибавляются корректно без lost updates.
   */
  private async applyDelta(
    manager: EntityManager,
    recipientId: string,
    deltaCount: number,
    deltaSum: number,
    stars: {
      stars1: number;
      stars2: number;
      stars3: number;
      stars4: number;
      stars5: number;
    },
  ) {
    await manager
      .createQueryBuilder()
      .insert()
      .into(SellerReviewAggEntity)
      .values({
        recipientId,
        reviewCount: deltaCount,
        ratingSum: deltaSum,
        ...stars,
      })
      .onConflict(
        `("recipient_id") DO UPDATE SET
          review_count = seller_review_agg.review_count + EXCLUDED.review_count,
          rating_sum   = seller_review_agg.rating_sum   + EXCLUDED.rating_sum,
          stars_1      = seller_review_agg.stars_1      + EXCLUDED.stars_1,
          stars_2      = seller_review_agg.stars_2      + EXCLUDED.stars_2,
          stars_3      = seller_review_agg.stars_3      + EXCLUDED.stars_3,
          stars_4      = seller_review_agg.stars_4      + EXCLUDED.stars_4,
          stars_5      = seller_review_agg.stars_5      + EXCLUDED.stars_5
        `,
      )
      .execute();
  }

  async onCreate(
    manager: EntityManager,
    recipientId: string,
    rating: number,
  ) {
    this.assertRating(rating);

    await this.applyDelta(
      manager,
      recipientId,
      +1,
      +rating,
      this.starsDelta(rating, +1),
    );
  }

  async onDelete(
    manager: EntityManager,
    recipientId: string,
    rating: number,
  ) {
    this.assertRating(rating);

    await this.applyDelta(
      manager,
      recipientId,
      -1,
      -rating,
      this.starsDelta(rating, -1),
    );
  }

  async onRatingChange(
    manager: EntityManager,
    recipientId: string,
    oldRating: number,
    newRating: number,
  ) {
    this.assertRating(oldRating);
    this.assertRating(newRating);

    const decOld = this.starsDelta(oldRating, -1);
    const incNew = this.starsDelta(newRating, +1);

    await this.applyDelta(
      manager,
      recipientId,
      0,
      newRating - oldRating,
      {
        stars1: decOld.stars1 + incNew.stars1,
        stars2: decOld.stars2 + incNew.stars2,
        stars3: decOld.stars3 + incNew.stars3,
        stars4: decOld.stars4 + incNew.stars4,
        stars5: decOld.stars5 + incNew.stars5,
      },
    );
  }
}
