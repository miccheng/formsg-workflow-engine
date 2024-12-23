import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SubmissionsController } from './submissions.controller';
import { SchedulerController } from './scheduler.controller';
import { AppService } from './app.service';
import { SubmissionService } from './submission.service';
import { TemporalService } from './temporal.service';

@Module({
  imports: [],
  controllers: [AppController, SubmissionsController, SchedulerController],
  providers: [AppService, SubmissionService, TemporalService],
})
export class AppModule {}
