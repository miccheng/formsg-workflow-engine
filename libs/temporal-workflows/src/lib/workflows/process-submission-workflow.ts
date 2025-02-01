import { proxyActivities, log, startChild } from '@temporalio/workflow';
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
  formData: any
): Promise<string> => {
  log.info('Sending Notifications', { formId });

  const persistenceResult = await persistSubmissionActivity(
    formId,
    submissionId,
    formData
  );

  if (persistenceResult === 'PERSISTED_SUBMISSION') {
    await startChild(WorkflowTable[formId], {
      args: [formId, submissionId, formData],
      workflowId: `process-${formId}-${submissionId}`,
    });
  }

  return `SUBMISSION_PROCESSED`;
};
