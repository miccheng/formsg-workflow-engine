import {
  Controller,
  Get,
  Post,
  Put,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Body,
  Delete,
  Query,
} from '@nestjs/common';
import { TemporalService } from './temporal.service';

type ApprovalRequestDto = {
  workflowId: string;
  recipientEmail: string;
};

type ApprovalResponseDto = {
  approved: boolean;
  reason?: string;
};

@Controller('approval-request')
export class ApprovalRequestController {
  constructor(private readonly temporalService: TemporalService) {}

  @Get(':workflowId')
  async show(@Param('workflowId') workflowId: string): Promise<string> {
    try {
      const status = await this.temporalService.queryWorkflowStatus(workflowId);
      return `Approval Status: ${status}`;
    } catch (e) {
      Logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() approvalRequest: ApprovalRequestDto): Promise<string> {
    Logger.log('Send Request to', { approvalRequest });

    try {
      await this.temporalService.startApprovalNeededWorkflow(
        approvalRequest.workflowId,
        approvalRequest.recipientEmail
      );

      return `Approval Request sent to ${approvalRequest.recipientEmail}`;
    } catch (e) {
      Logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':workflowId')
  async update(
    @Param('workflowId') workflowId: string,
    @Body() approvalResponse: ApprovalResponseDto
  ): Promise<string> {
    Logger.log('Response Body', { approvalResponse });

    try {
      await this.temporalService.respondToApprovalWorkflow(
        workflowId,
        approvalResponse
      );

      const status = await this.temporalService.queryWorkflowStatus(workflowId);
      return `Approval Status: ${status}`;
    } catch (e) {
      Logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':workflowId/:action')
  async approveRequest(
    @Param('workflowId') workflowId: string,
    @Param('action') action: string,
    @Query('reason') reason: string
  ): Promise<string> {
    try {
      await this.temporalService.respondToApprovalWorkflow(workflowId, {
        approved: action === 'approve',
        reason,
      });

      const status = await this.temporalService.queryWorkflowStatus(workflowId);
      return `Approval Status: ${status}`;
    } catch (e) {
      Logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':workflowId')
  async delete(@Param('workflowId') workflowId: string): Promise<string> {
    try {
      await this.temporalService.cancelWorkflow(workflowId);
      return `Workflow ${workflowId} cancelled`;
    } catch (e) {
      Logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
