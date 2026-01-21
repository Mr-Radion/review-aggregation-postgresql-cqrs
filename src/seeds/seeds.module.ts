import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedsService } from './seeds.service';
import { ReviewEntity } from '../reviews/entities/review.entity';
import { SellerReviewAggEntity } from '../review-aggregation/entities/seller-review-agg.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity, SellerReviewAggEntity])],
  providers: [SeedsService],
  exports: [SeedsService],
})
export class SeedsModule {}
