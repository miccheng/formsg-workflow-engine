import { proxyActivities, log, executeChild } from '@temporalio/workflow';
import { WorkflowTable } from '../workflow-table';
import { type Submissions, SubmissionStatus } from '@prisma/client';

import type * as decryptFormsgActivities from '../activities/decrypt-formsg-activity';
import type * as persistSubmissionActivities from '../activities/persist-submission-activity';
import type * as completeProcessingActivities from '../activities/complete-processing-activity';

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

const { completeProcessingActivity } = proxyActivities<
  typeof completeProcessingActivities
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

  let submission: Submissions;

  if (!formData) {
    submission = await decryptFormsgActivity(formId, submissionId);
  } else {
    submission = await persistSubmissionActivity(
      formId,
      submissionId,
      formData,
      createdAt
    );
  }

  if (submission.status !== SubmissionStatus.PROCESSED) {
    const childWorkflowResult = await executeChild(WorkflowTable[formId], {
      args: [submissionId],
      workflowId: `process-${formId}-${submissionId}`,
    });

    await completeProcessingActivity(formId, submissionId);

    return `SUBMISSION_PROCESSED: ${childWorkflowResult}`;
  } else {
    return `SUBMISSION_HAD_BEEN_PROCESSED: ${submissionId}`;
  }
};
