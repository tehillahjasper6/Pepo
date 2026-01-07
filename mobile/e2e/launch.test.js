const { device, expect, element, by } = require('detox');

describe('App Launch', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show splash screen', async () => {
    await expect(element(by.id('splash-screen'))).toBeVisible();
  });

  it('should navigate to login', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });
});
