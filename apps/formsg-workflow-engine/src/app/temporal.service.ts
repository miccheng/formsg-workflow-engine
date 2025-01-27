import { Injectable, Logger } from '@nestjs/common';
import {
  Connection,
  Client,
  ScheduleOverlapPolicy,
  Workflow,
} from '@temporalio/client';
import {
  WorkflowTable,
  AllWorkflows,
} from '@formsg-workflow-engine/temporal-workflows';

@Injectable()
export class TemporalService {
  client: Client;

  async _connectToTemporal(): Promise<Client> {
    const connectionOptions = {
      address: process.env.TEMPORAL_HOST || 'localhost:7233',
    };

    const connection = await Connection.connect(connectionOptions);
    this.client = new Client({ connection });
    return this.client;
  }

  async startFormWorkflow(formId: string, submissionId: string): Promise<void> {
    if (!this.client) {
      await this._connectToTemporal();
    }

    await this.client.workflow.start(WorkflowTable[formId], {
      taskQueue: 'formsg-workflow-engine',
      workflowId: `process-${formId}-${submissionId}`,
      args: [submissionId],
    });
  }

  async startCollationScheduler(
    formId: string,
    recipientEmail: string
  ): Promise<void> {
    if (!this.client) {
      await this._connectToTemporal();
    }

    const schedule = await this.client.schedule.create({
      action: {
        type: 'startWorkflow',
        workflowType: WorkflowTable[`collate-${formId}`] as Workflow,
        args: [formId, recipientEmail],
        taskQueue: 'collation-scheduler',
      },
      scheduleId: `collate-${formId}`,
      policies: {
        catchupWindow: '1 day',
        overlap: ScheduleOverlapPolicy.ALLOW_ALL,
      },
      spec: {
        intervals: [{ every: '1m' }],
      },
    });

    Logger.debug('collation-scheduler', { schedule });
  }

  async stopCollationScheduler(formId: string): Promise<void> {
    if (!this.client) {
      await this._connectToTemporal();
    }

    const handle = this.client.schedule.getHandle(`collate-${formId}`);
    await handle.delete();

    Logger.debug(`Deleted Schedule for ${formId}`);
  }

  async startApprovalNeededWorkflow(
    workflowId: string,
    recipientEmail: string
  ): Promise<void> {
    if (!this.client) {
      await this._connectToTemporal();
    }

    Logger.debug(
      `Starting Approval Request workflow for ${workflowId} (${recipientEmail})`
    );
    await this.client.workflow.start(AllWorkflows.approvalNeededWorkflow, {
      taskQueue: 'formsg-workflow-engine',
      workflowId: `approval-request-${workflowId}`,
      args: [workflowId, recipientEmail],
    });
  }

  async queryWorkflowStatus(workflowId: string): Promise<string> {
    if (!this.client) {
      await this._connectToTemporal();
    }
    Logger.debug(`Querying Approval Request status: ${workflowId}`);

    const handle = this.client.workflow.getHandle(
      `approval-request-${workflowId}`
    );
    const status = await handle.query(AllWorkflows.statusQuery);

    return `${status}`;
  }

  // Signal to the ApprovalNeededWorkflow with the response
  async respondToApprovalWorkflow(
    workflowId: string,
    response: { approved: boolean; reason?: string }
  ): Promise<void> {
    if (!this.client) {
      await this._connectToTemporal();
    }
    Logger.debug(
      `Signalling Approval Request for ${workflowId}: ${response.approved}, ${response.reason}`
    );

    const handle = this.client.workflow.getHandle(
      `approval-request-${workflowId}`
    );
    await handle.signal(AllWorkflows.respondSignal, response);
  }

  async cancelWorkflow(workflowId: string) {
    if (!this.client) {
      await this._connectToTemporal();
    }
    Logger.debug(`Cancelling Approval Request: ${workflowId}`);

    const handle = this.client.workflow.getHandle(
      `approval-request-${workflowId}`
    );
    await handle.cancel();
  }

  async checkVerificationCode(
    workflowId: string,
    code: string
  ): Promise<{ valid: boolean; message: string }> {
    if (!this.client) {
      await this._connectToTemporal();
    }
    Logger.debug(`Checking Verification Code: ${workflowId}`);

    const result = await this.client.workflow.execute(
      AllWorkflows.checkVerificationCodeWorkflow,
      {
        taskQueue: 'formsg-workflow-engine',
        workflowId: `verify-code-${workflowId}`,
        args: [code],
      }
    );

    Logger.debug(`Verification Code Result: ${result}`);

    return { valid: result === 'Verification code is valid', message: result };
  }
}
