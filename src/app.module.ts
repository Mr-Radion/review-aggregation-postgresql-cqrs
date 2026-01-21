import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ReviewsModule } from './reviews/reviews.module';
import { ReviewAggregationModule } from './review-aggregation/review-aggregation.module';
import { SeedsModule } from './seeds/seeds.module';
import { config } from 'dotenv';

config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'review_aggregation',
      synchronize: false,
      autoLoadEntities: true,
      migrationsRun: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    CqrsModule,
    ReviewsModule,
    ReviewAggregationModule,
    SeedsModule,
  ],
})
export class AppModule {}
