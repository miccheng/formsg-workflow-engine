import { Controller, Post, Body, Logger, Delete, Query } from '@nestjs/common';
import { TemporalService } from './temporal.service';

type CreateSchedulerDto = {
  formId: string;
  recipientEmail: string;
  interval: string;
};

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly temporalService: TemporalService) {}

  @Post()
  async create(
    @Body() createSchedulerDto: CreateSchedulerDto
  ): Promise<string> {
    Logger.log(
      `Start Scheduling for form: ${createSchedulerDto.formId} for ${createSchedulerDto.recipientEmail}`
    );

    await this.temporalService.startCollationScheduler(
      createSchedulerDto.formId,
      createSchedulerDto.recipientEmail
    );

    return `Started Scheduler`;
  }

  @Delete()
  async delete(@Query('formId') formId): Promise<string> {
    Logger.log(`Stop Scheduling FormID: ${formId}`);

    await this.temporalService.stopCollationScheduler(formId);

    return `Stopped Scheduler`;
  }
}
