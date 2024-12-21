import { proxyActivities, log } from '@temporalio/workflow';

import type * as validateEmailActivities from '../activities/validate-email-activity';

const { validateEmailActivity } = proxyActivities<
  typeof validateEmailActivities
>({
  startToCloseTimeout: '1 minute',
});

export const checkEmailWorkflow = async (email: string): Promise<string> => {
  log.info('Checking email', { email });

  const result = await validateEmailActivity(email);

  if (result) {
    return 'Email is valid';
  } else {
    return 'Email is not valid';
  }
};
