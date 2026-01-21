import { CreateReviewDto } from '../../dto/create-review.dto';

export class CreateReviewCommand {
  constructor(public readonly dto: CreateReviewDto) {}
}
