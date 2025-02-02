import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SubmissionsController } from './submissions.controller';
import { SchedulerController } from './scheduler.controller';
import { ApprovalRequestController } from './approval-request.controller';
import { VerificationCodeController } from './verification-code.controller';
import { AppService } from './app.service';
import { TemporalService } from './temporal.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    SubmissionsController,
    SchedulerController,
    ApprovalRequestController,
    VerificationCodeController,
  ],
  providers: [AppService, TemporalService],
})
export class AppModule {}
