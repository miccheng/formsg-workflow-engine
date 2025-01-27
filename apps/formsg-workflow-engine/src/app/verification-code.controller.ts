import {
  Controller,
  Post,
  Req,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { TemporalService } from './temporal.service';
import { nanoid } from 'nanoid';

type VerificationCodeResponse = {
  valid: boolean;
  message: string;
};

@Controller('verification-code')
export class VerificationCodeController {
  constructor(private readonly temporalService: TemporalService) {}

  @Post()
  async create(@Req() request: Request): Promise<VerificationCodeResponse> {
    Logger.debug('Verification Code', request.body);

    try {
      const result = await this.temporalService.checkVerificationCode(
        nanoid(),
        request.body.verificationCode
      );

      if (result.valid) {
        return result;
      } else {
        throw new BadRequestException(result);
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;

      Logger.error('Error', e);
      throw new HttpException(
        'Error processing verification code',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
