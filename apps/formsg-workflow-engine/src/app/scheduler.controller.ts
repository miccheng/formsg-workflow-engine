import { Controller, Post, Req, Logger, Delete, Query } from '@nestjs/common';
import { TemporalService } from './temporal.service';
import { Request } from 'express';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly temporalService: TemporalService) {}

  @Post()
  async create(@Req() request: Request): Promise<string> {
    Logger.log('Start Scheduling');

    const formId = `${request.body.formId}`;

    await this.temporalService.startCollationScheduler(formId);

    return `Started Scheduler`;
  }

  @Delete()
  async delete(@Query('formId') formId): Promise<string> {
    Logger.log('Stop Scheduling');
    Logger.log(`FormID: ${formId}`);

    await this.temporalService.stopCollationScheduler(formId);

    return `Stopped Scheduler`;
  }
}
