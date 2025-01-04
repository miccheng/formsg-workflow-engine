import { postRequest } from '../helpers/http-request-helper';
import { log } from '@temporalio/activity';

export const validateVerificationCodeActivity = async (
  verificationCode: string
): Promise<string> => {
  log.info('Validating verification code:', { verificationCode });
  if (!/^[A-Z]{4}[0-9]{4}/i.test(verificationCode)) return 'NOT_OK';

  const url = `${
    process.env.VERIFICATION_API || 'http://localhost:8001'
  }/verify`;

  try {
    const response = await postRequest(url, {
      verificationCode,
    });

    return response.status === 'OK' ? 'OK' : 'NOT_OK';
  } catch (error) {
    if (error.response.status === 400) {
      return error.response.data?.status;
    }
    throw error;
  }
};
