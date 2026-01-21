import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { CreateReviewCommand } from '../cqrs/commands/create-review.command';
import { UpdateReviewCommand } from '../cqrs/commands/update-review.command';
import { DeleteReviewCommand } from '../cqrs/commands/delete-review.command';

@Controller('/reviews')
export class ReviewsCommandsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.commandBus.execute(new CreateReviewCommand(dto));
  }

  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateReviewDto) {
    return this.commandBus.execute(new UpdateReviewCommand(id, dto));
  }

  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commandBus.execute(new DeleteReviewCommand(id));
  }
}
