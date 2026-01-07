const { device, expect, element, by } = require('detox');

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
  });

  it('should show welcome screen', async () => {
    await expect(element(by.id('welcome-screen'))).toBeVisible();
  });

  it('should navigate to signup', async () => {
    await element(by.id('signup-button')).tap();
    await expect(element(by.id('signup-screen'))).toBeVisible();
  });

  it('should complete signup', async () => {
    await element(by.id('input-email')).typeText('testuser@example.com');
    await element(by.id('input-password')).typeText('Test1234!');
    await element(by.id('submit-signup')).tap();
    await expect(element(by.id('otp-screen'))).toBeVisible();
  });
});
