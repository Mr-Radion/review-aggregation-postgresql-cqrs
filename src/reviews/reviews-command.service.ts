import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';
import { ReviewAggWriterService } from '../review-aggregation/services/review-agg-writer.service';
import { ReviewAggCacheService } from '../review-aggregation/services/review-agg-cache.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsCommandService {
  constructor(
    private readonly ds: DataSource,
    private readonly aggWriter: ReviewAggWriterService,
    private readonly aggCache: ReviewAggCacheService,
  ) {}

  /**
   * Создание отзыва. Защита от race condition:
   * - При одновременном создании нескольких отзывов для одного seller
   * - PostgreSQL атомарно обрабатывает конфликты через ON CONFLICT DO UPDATE
   * - Все дельты прибавляются корректно без lost updates
   */
  async create(dto: CreateReviewDto) {
    if (dto.recipientId === dto.authorId) {
      throw new BadRequestException('recipientId cannot equal authorId');
    }

    const res = await this.ds.transaction(async (manager) => {
      const review = manager.create(ReviewEntity, dto);
      const saved = await manager.save(ReviewEntity, review);
      await this.aggWriter.onCreate(manager, dto.recipientId, dto.rating);
      return saved;
    });

    await this.aggCache.invalidate(dto.recipientId);
    return res;
  }

  async update(id: string, dto: UpdateReviewDto) {
    let recipientId: string;

    const result = await this.ds.transaction(async (manager) => {
      const existing = await manager
        .createQueryBuilder(ReviewEntity, 'r')
        .setLock('pessimistic_write')
        .where('r.id = :id', { id })
        .getOne();

      if (!existing) {
        throw new NotFoundException('Review not found');
      }

      recipientId = existing.recipientId;
      const oldRating = existing.rating;
      const newRating = dto.rating ?? oldRating;

      existing.content = dto.content ?? existing.content;
      existing.rating = newRating;

      const saved = await manager.save(ReviewEntity, existing);

      if (newRating !== oldRating) {
        await this.aggWriter.onRatingChange(manager, existing.recipientId, oldRating, newRating);
      }

      return saved;
    });

    await this.aggCache.invalidate(recipientId);
    return result;
  }

  async delete(id: string) {
    let recipientId: string;

    const result = await this.ds.transaction(async (manager) => {
      const existing = await manager
        .createQueryBuilder(ReviewEntity, 'r')
        .setLock('pessimistic_write')
        .where('r.id = :id', { id })
        .getOne();

      if (!existing) {
        throw new NotFoundException('Review not found');
      }

      recipientId = existing.recipientId;
      const rating = existing.rating;

      await manager.delete(ReviewEntity, { id });
      await this.aggWriter.onDelete(manager, recipientId, rating);

      return { deleted: true };
    });

    await this.aggCache.invalidate(recipientId);
    return result;
  }
}
