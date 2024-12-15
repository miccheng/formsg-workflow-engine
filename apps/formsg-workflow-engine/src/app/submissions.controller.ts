import { Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { SubmissionService } from './submission.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  show(): string {
    return 'Hello World!';
  }

  @Post()
  create(@Req() request: Request): string {
    // console.log('Webhook Body', request.body.data);

    const postUri = `${process.env.APP_DOMAIN}/api/submissions`;
    const response = this.submissionService.decryptFormData(
      request.get('X-FormSG-Signature'),
      postUri,
      request.body.data
    );
    return response.message;
  }
}
