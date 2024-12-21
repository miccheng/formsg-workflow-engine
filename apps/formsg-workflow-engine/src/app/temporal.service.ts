import { Injectable } from '@nestjs/common';
import { Connection, Client } from '@temporalio/client';
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
}
