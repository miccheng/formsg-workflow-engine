import { proxyActivities, log } from '@temporalio/workflow';

import type * as collateSubmissionsActivities from '../activities/collate-submissions-activity';

const { collateSubmissionsActivity } = proxyActivities<
  typeof collateSubmissionsActivities
>({
  startToCloseTimeout: '5 minute',
});

export const collate675d3e0bf7757f96a3e82d2dWorkflow = async (
  formId: string,
  targetDate?: string
): Promise<string> => {
  log.info('Collating submissions for formId', { formId });

  if (!targetDate) {
    const currDate = Date.now();
    targetDate = currDate.toLocaleString();
  }

  const submissionsData = await collateSubmissionsActivity(formId, targetDate);
  log.debug('Found entries');
  log.debug(submissionsData);

  return 'OK';
};
