import { postRequest } from '../helpers/http-request-helper';

export const validateVerificationCodeActivity = async (
  verificationCode: string
): Promise<string> => {
  if (!/^[A-Z]{4}[0-9]{4}/i.test(verificationCode)) return 'NOT_OK';

  const url = `${
    process.env.VERIFICATION_API || 'http://localhost:8001'
  }/verify`;

  const response = await postRequest(url, {
    verificationCode,
  });

  return response.message === 'OK' ? 'OK' : 'NOT_OK';
};
