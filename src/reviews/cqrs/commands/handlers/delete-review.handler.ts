import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteReviewCommand } from '../delete-review.command';
import { ReviewsCommandService } from '../../../../reviews/reviews-command.service';

@CommandHandler(DeleteReviewCommand)
export class DeleteReviewHandler implements ICommandHandler<DeleteReviewCommand> {
  constructor(private readonly svc: ReviewsCommandService) {}

  execute(cmd: DeleteReviewCommand) {
    return this.svc.delete(cmd.id);
  }
}
