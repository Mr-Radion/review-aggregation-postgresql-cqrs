import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetSellerAggregateQuery } from '../cqrs/queries/get-seller-aggregate.query';

@Controller('/sellers')
export class ReviewsQueriesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':recipientId/reviews/aggregate')
  getAgg(@Param('recipientId', new ParseUUIDPipe()) recipientId: string) {
    return this.queryBus.execute(new GetSellerAggregateQuery(recipientId));
  }
}
