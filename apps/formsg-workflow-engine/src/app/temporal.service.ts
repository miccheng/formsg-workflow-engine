import { Injectable } from '@nestjs/common';
import { Connection, Client } from '@temporalio/client';
import { AllWorkflows } from '@formsg-workflow-engine/temporal-workflows';

@Injectable()
export class TemporalService {
  client: Client;

  async _connectToTemporal(): Promise<Client> {
    const connection = await Connection.connect();
    this.client = new Client({ connection });
    return this.client;
  }

  async startValidateEmailWorkflow(
    submissionId: string,
    email: string
  ): Promise<void> {
    if (!this.client) {
      await this._connectToTemporal();
    }

    await this.client.workflow.start(AllWorkflows.checkEmailWorkflow, {
      taskQueue: 'formsg-workflow-engine',
      workflowId: `submission-${submissionId}-validate-email`,
      args: [email],
    });
  }
}
