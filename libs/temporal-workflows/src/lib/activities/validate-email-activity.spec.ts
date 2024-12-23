import { validateEmailActivity } from './validate-email-activity';
import { MockActivityEnvironment } from '@temporalio/testing';

describe('validateEmailActivity', () => {
  let mockTemporalEnv: MockActivityEnvironment;

  beforeEach(() => {
    mockTemporalEnv = new MockActivityEnvironment({ attempt: 2 });
  });

  it('should validate email', async () => {
    expect(
      await mockTemporalEnv.run(validateEmailActivity, 'me@exmaple.com')
    ).toBeTruthy();
  });

  it('should not validate email', async () => {
    expect(
      await mockTemporalEnv.run(validateEmailActivity, 'meexmaple.com')
    ).not.toBeTruthy();
  });
});
