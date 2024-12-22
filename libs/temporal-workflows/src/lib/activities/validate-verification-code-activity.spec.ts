import { validateVerificationCodeActivity } from './validate-verification-code-activity';

describe('validateVerificationCodeActivity', () => {
  it('should validate code format - 4 letters followed by 4 digits', async () => {
    expect(await validateVerificationCodeActivity('ABCD1234')).toBe('OK');
    expect(await validateVerificationCodeActivity('BEFG4321')).toBe('OK');
  });

  it('should validate code format', async () => {
    expect(await validateVerificationCodeActivity('1234')).toBe('NOT_OK');
    expect(await validateVerificationCodeActivity('1234ABCD')).toBe('NOT_OK');
    // expect(await validateVerificationCodeActivity('DEFG4321')).toBe('NOT_OK');
  });
});
