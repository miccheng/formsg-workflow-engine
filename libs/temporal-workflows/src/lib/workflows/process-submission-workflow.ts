import { proxyActivities, log, executeChild } from '@temporalio/workflow';
import { WorkflowTable } from '../workflow-table';

import type * as decryptFormsgActivities from '../activities/decrypt-formsg-activity';
import type * as persistSubmissionActivities from '../activities/persist-submission-activity';

const { decryptFormsgActivity } = proxyActivities<
  typeof decryptFormsgActivities
>({
  startToCloseTimeout: '5 minute',
});

const { persistSubmissionActivity } = proxyActivities<
  typeof persistSubmissionActivities
>({
  startToCloseTimeout: '5 minute',
});

export const processSubmissionWorkflow = async (
  formId: string,
  submissionId: string,
  formData?: any,
  createdAt?: string
): Promise<string> => {
  log.info('Sending Notifications', { formId });

  let result: string;

  if (!formData) {
    result = await decryptFormsgActivity(formId, submissionId);
  } else {
    result = await persistSubmissionActivity(
      formId,
      submissionId,
      formData,
      createdAt
    );
  }

  if (['PERSISTED_SUBMISSION', 'DECRYPTION_SUCCESSFUL'].includes(result)) {
    const childWorkflowResult = await executeChild(WorkflowTable[formId], {
      args: [submissionId],
      workflowId: `process-${formId}-${submissionId}`,
    });

    return `SUBMISSION_PROCESSED: ${childWorkflowResult}`;
  } else {
    return `SUBMISSION_HAD_BEEN_PROCESSED: ${result}`;
  }
};
