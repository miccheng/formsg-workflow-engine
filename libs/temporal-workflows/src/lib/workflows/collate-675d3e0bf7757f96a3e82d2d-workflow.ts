import { proxyActivities, log } from '@temporalio/workflow';
import { DateTime } from 'luxon';

import type * as collateSubmissionsActivities from '../activities/collate-submissions-activity';
import type * as emailActivities from '../activities/email-activity';

const { collateSubmissionsActivity } = proxyActivities<
  typeof collateSubmissionsActivities
>({
  startToCloseTimeout: '5 minute',
});

const { emailActivity } = proxyActivities<typeof emailActivities>({
  startToCloseTimeout: '1 minute',
});

export const collate675d3e0bf7757f96a3e82d2dWorkflow = async (
  formId: string,
  recipientEmail: string,
  targetDate?: string
): Promise<string> => {
  log.info('Collating submissions for formId', { formId });

  if (!targetDate) {
    targetDate = DateTime.now().toFormat('yyyy-MM-dd');
  }

  const submissionsData = await collateSubmissionsActivity(formId, targetDate);

  const emailResult = await emailActivity({
    email: recipientEmail,
    subject: `Daily digest of the submissions for form ${formId} on ${targetDate}`,
    message: `Here's the daily digest of the submissions for form ${formId} on ${targetDate}:`,
    attachments: [
      {
        filename: `submissions-${formId}-${targetDate}.csv`,
        content: submissionsData,
      },
    ],
  });
  log.info('Email sent', { emailResult });

  return `Email sent to ${recipientEmail}`;
};
