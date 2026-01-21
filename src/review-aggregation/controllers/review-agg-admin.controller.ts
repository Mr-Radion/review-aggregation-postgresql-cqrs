import { Controller, Post, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ReviewAggSyncService } from '../services/review-agg-sync.service';
import { AdminKeyGuard } from '../guards/admin-key.guard';

@Controller('/admin/reviews-aggregate')
@UseGuards(AdminKeyGuard)
export class ReviewAggAdminController {
  constructor(private readonly sync: ReviewAggSyncService) {}

  @Post('/rebuild')
  rebuildAll() {
    return this.sync.rebuildAll();
  }

  @Post('/rebuild/:recipientId')
  rebuildOne(@Param('recipientId', new ParseUUIDPipe()) recipientId: string) {
    return this.sync.rebuildOne(recipientId);
  }
}
