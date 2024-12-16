import { Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { SubmissionService } from './submission.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  async show(): Promise<string> {
    const submissionsCount = await prisma.submissions.count();

    return `Hello World! We found ${submissionsCount} submissions in the database.`;
  }

  @Post()
  create(@Req() request: Request): string {
    // console.log('Webhook Body', request.body.data);

    const protocol =
      request.headers['x-forwarded-proto'] !== undefined
        ? request.headers['x-forwarded-proto']
        : request.protocol;
    const response = this.submissionService.decryptFormData(
      request.get('X-FormSG-Signature'),
      `${protocol}://${request.hostname}${request.path}`,
      request.body.data
    );
    return response.message;
  }
}
