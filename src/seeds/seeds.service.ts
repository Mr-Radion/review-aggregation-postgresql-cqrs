import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReviewEntity } from '../reviews/entities/review.entity';
import { SellerReviewAggEntity } from '../review-aggregation/entities/seller-review-agg.entity';

@Injectable()
export class SeedsService {
  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const reviewRepo = this.dataSource.getRepository(ReviewEntity);
      const existingReviews = await reviewRepo.count();

      if (existingReviews > 0) {
        console.log('⚠️  Database already contains data. Skipping seeds.');
        return;
      }

      const reviews = [
        {
          recipientId: '550e8400-e29b-41d4-a716-446655440001',
          authorId: '550e8400-e29b-41d4-a716-446655440010',
          rating: 5,
          content: 'Отличный продавец! Быстрая доставка, качественный товар.',
        },
        {
          recipientId: '550e8400-e29b-41d4-a716-446655440001',
          authorId: '550e8400-e29b-41d4-a716-446655440011',
          rating: 4,
          content: 'Хороший продавец, рекомендую. Небольшая задержка с доставкой.',
        },
        {
          recipientId: '550e8400-e29b-41d4-a716-446655440001',
          authorId: '550e8400-e29b-41d4-a716-446655440012',
          rating: 5,
          content: 'Супер! Всё на высшем уровне.',
        },
        {
          recipientId: '550e8400-e29b-41d4-a716-446655440002',
          authorId: '550e8400-e29b-41d4-a716-446655440013',
          rating: 3,
          content: 'Нормально, но ожидал большего.',
        },
        {
          recipientId: '550e8400-e29b-41d4-a716-446655440002',
          authorId: '550e8400-e29b-41d4-a716-446655440014',
          rating: 2,
          content: 'Товар пришел с дефектом, но продавец вернул деньги.',
        },
        {
          recipientId: '550e8400-e29b-41d4-a716-446655440003',
          authorId: '550e8400-e29b-41d4-a716-446655440015',
          rating: 5,
          content: 'Отличное качество, быстрая доставка!',
        },
        {
          recipientId: '550e8400-e29b-41d4-a716-446655440003',
          authorId: '550e8400-e29b-41d4-a716-446655440016',
          rating: 4,
          content: 'Хороший продавец, рекомендую.',
        },
        {
          recipientId: '550e8400-e29b-41d4-a716-446655440003',
          authorId: '550e8400-e29b-41d4-a716-446655440017',
          rating: 5,
          content: 'Супер качество и сервис!',
        },
        {
          recipientId: '550e8400-e29b-41d4-a716-446655440003',
          authorId: '550e8400-e29b-41d4-a716-446655440018',
          rating: 1,
          content: 'Товар не соответствует описанию, очень разочарован.',
        },
        {
          recipientId: '550e8400-e29b-41d4-a716-446655440003',
          authorId: '550e8400-e29b-41d4-a716-446655440019',
          rating: 5,
          content: 'Лучший продавец на платформе!',
        },
      ];

      const reviewEntities = reviews.map((review) => reviewRepo.create(review));
      await reviewRepo.save(reviewEntities);

      console.log(`✅ Seeded ${reviews.length} reviews`);

      const aggRepo = this.dataSource.getRepository(SellerReviewAggEntity);
      const uniqueRecipients = [...new Set(reviews.map((r) => r.recipientId))];

      for (const recipientId of uniqueRecipients) {
        const recipientReviews = reviews.filter((r) => r.recipientId === recipientId);
        const stars = { stars1: 0, stars2: 0, stars3: 0, stars4: 0, stars5: 0 };
        let sum = 0;

        for (const review of recipientReviews) {
          sum += review.rating;
          if (review.rating === 1) stars.stars1++;
          else if (review.rating === 2) stars.stars2++;
          else if (review.rating === 3) stars.stars3++;
          else if (review.rating === 4) stars.stars4++;
          else if (review.rating === 5) stars.stars5++;
        }

        const agg = aggRepo.create({
          recipientId,
          reviewCount: recipientReviews.length,
          ratingSum: sum,
          ...stars,
        });

        await aggRepo.save(agg);
      }

      console.log(`✅ Seeded aggregates for ${uniqueRecipients.length} recipients`);
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async clear() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const reviewRepo = this.dataSource.getRepository(ReviewEntity);
      const aggRepo = this.dataSource.getRepository(SellerReviewAggEntity);

      await reviewRepo.delete({});
      await aggRepo.delete({});

      console.log('✅ Database cleared');
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
