import { proxyActivities, log } from '@temporalio/workflow';

import type * as validateVerificationCodeActivities from '../activities/validate-verification-code-activity';

const { validateVerificationCodeActivity } = proxyActivities<
  typeof validateVerificationCodeActivities
>({
  startToCloseTimeout: '1 minute',
});

export const checkVerificationCodeWorkflow = async (
  verificationCode: string
): Promise<string> => {
  log.info('Checking verification code', { verificationCode });

  const isValid = await validateVerificationCodeActivity(verificationCode);

  if (isValid === 'OK') {
    log.info('Verification code is valid');
    return 'Verification code is valid';
  } else {
    log.info('Verification code is invalid');
    return 'Verification code is invalid';
  }
};
