import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateReviewCommand } from '../create-review.command';
import { ReviewsCommandService } from '../../../../reviews/reviews-command.service';

@CommandHandler(CreateReviewCommand)
export class CreateReviewHandler implements ICommandHandler<CreateReviewCommand> {
  constructor(private readonly svc: ReviewsCommandService) {}

  execute(cmd: CreateReviewCommand) {
    return this.svc.create(cmd.dto);
  }
}
