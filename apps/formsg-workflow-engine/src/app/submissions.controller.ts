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
import { SubmissionService } from './submission.service';
import { TemporalService } from './temporal.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly temporalService: TemporalService
  ) {}

  @Get()
  async show(): Promise<string> {
    const submissionsCount = await prisma.submissions.count();

    return `Hello World! We found ${submissionsCount} submissions in the database.`;
  }

  @Post()
  async create(@Req() request: Request): Promise<string> {
    Logger.debug('Webhook Body', request.body.data);

    try {
      const theForm = await prisma.sGForms.findUniqueOrThrow({
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

      const response = await this.submissionService.decryptFormData({
        ...requestDetails,
        formSecretKey: theForm.formSecret,
        formData: request.body.data,
      });

      await prisma.submissions.create({
        data: {
          formId: request.body.data.formId,
          submissionId: request.body.data.submissionId,
          formData: response.formData,
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

      Logger.log(response.message);
      return response.message;
    } catch (e) {
      Logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
