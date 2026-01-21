import { UpdateReviewDto } from '../../dto/update-review.dto';

export class UpdateReviewCommand {
  constructor(public readonly id: string, public readonly dto: UpdateReviewDto) {}
}
