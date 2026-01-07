const { device, expect, element, by } = require('detox');

describe('Navigation', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should navigate to profile', async () => {
    await element(by.id('tab-profile')).tap();
    await expect(element(by.id('profile-screen'))).toBeVisible();
  });

  it('should navigate to giveaways', async () => {
    await element(by.id('tab-giveaways')).tap();
    await expect(element(by.id('giveaways-screen'))).toBeVisible();
  });

  it('should navigate to messages', async () => {
    await element(by.id('tab-messages')).tap();
    await expect(element(by.id('messages-screen'))).toBeVisible();
  });
});
