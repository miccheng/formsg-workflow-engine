import { proxyActivities, log, executeChild } from '@temporalio/workflow';
import { WorkflowTable } from '../workflow-table';

import type * as persistSubmissionActivities from '../activities/persist-submission-activity';

const { persistSubmissionActivity } = proxyActivities<
  typeof persistSubmissionActivities
>({
  startToCloseTimeout: '5 minute',
});

export const processSubmissionWorkflow = async (
  formId: string,
  submissionId: string,
  formData: any,
  createdAt?: string
): Promise<string> => {
  log.info('Sending Notifications', { formId });

  const persistenceResult = await persistSubmissionActivity(
    formId,
    submissionId,
    formData,
    createdAt
  );

  if (persistenceResult === 'PERSISTED_SUBMISSION') {
    const result = await executeChild(WorkflowTable[formId], {
      args: [submissionId],
      workflowId: `process-${formId}-${submissionId}`,
    });

    return `SUBMISSION_PROCESSED: ${result}`;
  } else {
    return `SUBMISSION_HAD_BEEN_PROCESSED: ${persistenceResult}`;
  }
};
