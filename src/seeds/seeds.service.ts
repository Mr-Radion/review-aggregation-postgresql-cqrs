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
      // Проверяем, есть ли уже данные
      const reviewRepo = this.dataSource.getRepository(ReviewEntity);
      const existingReviews = await reviewRepo.count();

      if (existingReviews > 0) {
        console.log('⚠️  Database already contains data. Skipping seeds.');
        return;
      }

      // Создаем тестовые данные
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

      // Вставляем отзывы
      const reviewEntities = reviews.map((review) => reviewRepo.create(review));
      await reviewRepo.save(reviewEntities);

      console.log(`✅ Seeded ${reviews.length} reviews`);

      // Пересчитываем агрегаты для всех продавцов
      const aggRepo = this.dataSource.getRepository(SellerReviewAggEntity);
      const uniqueRecipients = [...new Set(reviews.map((r) => r.recipientId))];

      for (const recipientId of uniqueRecipients) {
        const recipientReviews = reviews.filter((r) => r.recipientId === recipientId);
        const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        let sum = 0;

        for (const review of recipientReviews) {
          const key = String(review.rating);
          distribution[key]++;
          sum += review.rating;
        }

        const agg = aggRepo.create({
          recipientId,
          reviewCount: recipientReviews.length,
          ratingSum: sum,
          ratingDistribution: distribution,
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
