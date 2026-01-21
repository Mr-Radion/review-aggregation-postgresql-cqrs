import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { SellerReviewAggEntity } from './entities/seller-review-agg.entity';
import { SellerReviewAggView } from './entities/seller-review-agg.view';
import { ReviewAggWriterService } from './services/review-agg-writer.service';
import { ReviewAggSyncService } from './services/review-agg-sync.service';
import { ReviewAggCacheService } from './services/review-agg-cache.service';
import { ReviewAggAdminController } from './controllers/review-agg-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerReviewAggEntity, SellerReviewAggView]),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      },
    },
    ReviewAggWriterService,
    ReviewAggSyncService,
    ReviewAggCacheService,
  ],
  controllers: [ReviewAggAdminController],
  exports: [ReviewAggWriterService, ReviewAggSyncService, ReviewAggCacheService, TypeOrmModule],
})
export class ReviewAggregationModule {}

