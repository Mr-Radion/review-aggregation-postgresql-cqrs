import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { ReviewsCommandsController } from './controllers/reviews.commands.controller';
import { ReviewsQueriesController } from './controllers/reviews.queries.controller';
import { ReviewsCommandService } from './reviews-command.service';
import { ReviewAggregationModule } from '../review-aggregation/review-aggregation.module';
import { CreateReviewHandler } from './cqrs/commands/handlers/create-review.handler';
import { UpdateReviewHandler } from './cqrs/commands/handlers/update-review.handler';
import { DeleteReviewHandler } from './cqrs/commands/handlers/delete-review.handler';
import { GetSellerAggregateHandler } from './cqrs/queries/handlers/get-seller-aggregate.handler';
import { SellerReviewAggView } from '../review-aggregation/entities/seller-review-agg.view';

const CommandHandlers = [CreateReviewHandler, UpdateReviewHandler, DeleteReviewHandler];
const QueryHandlers = [GetSellerAggregateHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ReviewEntity, SellerReviewAggView]),
    ReviewAggregationModule,
  ],
  controllers: [ReviewsCommandsController, ReviewsQueriesController],
  providers: [ReviewsCommandService, ...CommandHandlers, ...QueryHandlers],
})
export class ReviewsModule {}
