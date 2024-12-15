import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SubmissionsController } from './submissions.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, SubmissionsController],
  providers: [AppService],
})
export class AppModule {}
