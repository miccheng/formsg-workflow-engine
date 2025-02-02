import {
  Controller,
  Get,
  Post,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { TemporalService } from './temporal.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SubmissionCreatedResponse = {
  status: string;
  message: string;
  error?: string;
};

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly temporalService: TemporalService) {}

  @Get()
  async show(): Promise<string> {
    const submissionsCount = await prisma.submissions.count();

    return `Hello World! We found ${submissionsCount} submissions in the database.`;
  }

  @Post()
  async create(@Req() request: Request): Promise<SubmissionCreatedResponse> {
    Logger.debug('Webhook Body', request.body.data);

    try {
      await prisma.sGForms.findUniqueOrThrow({
        select: { formSecret: true },
        where: { formId: request.body.data.formId },
      });
      const protocol =
        request.headers['x-forwarded-proto'] !== undefined
          ? request.headers['x-forwarded-proto']
          : request.protocol;

      const requestDetails = {
        signature: request.get('X-FormSG-Signature'),
        postURI: `${protocol}://${request.hostname}${request.path}`,
      };

      await prisma.submissions.create({
        data: {
          formId: request.body.data.formId,
          submissionId: request.body.data.submissionId,
          encryptedContent: {
            requestBody: request.body.data,
            requestDetails: requestDetails,
          },
        },
      });

      await this.temporalService.startFormWorkflow(
        request.body.data.formId,
        request.body.data.submissionId
      );

      Logger.log('Submission created successfully');
      return {
        status: 'success',
        message: 'Submission created successfully',
      };
    } catch (e) {
      Logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
