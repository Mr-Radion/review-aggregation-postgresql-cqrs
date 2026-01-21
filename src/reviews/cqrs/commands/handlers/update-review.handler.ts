import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateReviewCommand } from '../update-review.command';
import { ReviewsCommandService } from '../../../../reviews/reviews-command.service';

@CommandHandler(UpdateReviewCommand)
export class UpdateReviewHandler implements ICommandHandler<UpdateReviewCommand> {
  constructor(private readonly svc: ReviewsCommandService) {}

  execute(cmd: UpdateReviewCommand) {
    return this.svc.update(cmd.id, cmd.dto);
  }
}
