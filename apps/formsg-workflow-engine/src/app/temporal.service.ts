import { Injectable, Logger } from '@nestjs/common';
import {
  Connection,
  Client,
  ScheduleOverlapPolicy,
  Workflow,
} from '@temporalio/client';
import { WorkflowTable } from '@formsg-workflow-engine/temporal-workflows';

@Injectable()
export class TemporalService {
  client: Client;

  async _connectToTemporal(): Promise<Client> {
    const connection = await Connection.connect();
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

  async startCollationScheduler(formId: string): Promise<void> {
    if (!this.client) {
      await this._connectToTemporal();
    }

    const schedule = await this.client.schedule.create({
      action: {
        type: 'startWorkflow',
        workflowType: WorkflowTable[`collate-${formId}`] as Workflow,
        args: [formId],
        taskQueue: 'schedules',
      },
      scheduleId: `collate-${formId}`,
      policies: {
        catchupWindow: '1 day',
        overlap: ScheduleOverlapPolicy.ALLOW_ALL,
      },
      spec: {
        intervals: [{ every: '30s' }],
      },
    });

    Logger.debug('Schedule', { schedule });
  }

  async stopCollationScheduler(formId: string): Promise<void> {
    if (!this.client) {
      await this._connectToTemporal();
    }

    const handle = this.client.schedule.getHandle(`collate-${formId}`);
    await handle.delete();

    Logger.debug(`Deleted Schedule for ${formId}`);
  }
}
