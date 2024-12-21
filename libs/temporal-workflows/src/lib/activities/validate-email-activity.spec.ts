import { validateEmailActivity } from './validate-email-activity';

describe('validateEmailActivity', () => {
  it('should validate email', async () => {
    expect(await validateEmailActivity('me@exmaple.com')).toBeTruthy();
  });

  it('should not validate email', async () => {
    expect(await validateEmailActivity('meexmaple.com')).not.toBeTruthy();
  });
});
