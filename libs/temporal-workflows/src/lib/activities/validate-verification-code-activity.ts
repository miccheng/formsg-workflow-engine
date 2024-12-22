export const validateVerificationCodeActivity = async (
  verificationCode: string
): Promise<string> => {
  return /^[A-Z]{4}[0-9]{4}/.test(verificationCode) ? 'OK' : 'NOT_OK';
};
