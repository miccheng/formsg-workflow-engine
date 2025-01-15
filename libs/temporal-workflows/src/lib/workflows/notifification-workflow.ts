import { proxyActivities, log } from '@temporalio/workflow';

import type * as notificationActivities from '../activities/notify-remote-api-activity';

const { notifyRemoteApiActivity } = proxyActivities<
  typeof notificationActivities
>({
  startToCloseTimeout: '5 minute',
});

export const notificationWorkflow = async (
  formId: string,
  submissionId: string,
  activationCode: string
): Promise<string> => {
  log.info('Sending Notifications', { formId });

  const notificationResult = await notifyRemoteApiActivity({
    formId,
    submissionId,
    activationCode,
  });

  log.info('Notification sent', { notificationResult });

  return `Notification sent for ${submissionId}`;
};
