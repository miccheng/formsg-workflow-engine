import { validateVerificationCodeActivity } from './validate-verification-code-activity';
import { MockActivityEnvironment } from '@temporalio/testing';

jest.mock('../helpers/http-request-helper', () => {
  return {
    postRequest: async (url: string, data: any): Promise<any> => {
      if (data.verificationCode.startsWith('D')) {
        return { status: 'NOT_OK' };
      }
      return { status: 'OK' };
    },
  };
});

describe('validateVerificationCodeActivity', () => {
  let mockTemporalEnv: MockActivityEnvironment;

  beforeEach(() => {
    mockTemporalEnv = new MockActivityEnvironment({ attempt: 2 });
  });

  it.each([
    ['ABCD1234', 'OK'],
    ['abcd1234', 'OK'],
    ['BEFG4321', 'OK'],
    ['befg4321', 'OK'],
    ['1234', 'NOT_OK'],
    ['1234ABCD', 'NOT_OK'],
    ['DEFG4321', 'NOT_OK'],
  ])(
    'should validate code format (4 letters followed by 4 digits) for %s',
    async (code, expected) => {
      expect(
        await mockTemporalEnv.run(validateVerificationCodeActivity, code)
      ).toBe(expected);
    }
  );
});
