import { Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('submissions')
export class SubmissionsController {
  @Get()
  show(): string {
    return 'Hello World!';
  }

  @Post()
  create(@Req() request: Request): string {
    console.log('Webhook Body', request.body.data);
    return 'Thank you for your submission!';
  }
}
