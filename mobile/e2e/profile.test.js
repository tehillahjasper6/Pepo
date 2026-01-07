const { device, expect, element, by } = require('detox');

describe('Profile Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await element(by.id('tab-profile')).tap();
  });

  it('should show profile screen', async () => {
    await expect(element(by.id('profile-screen'))).toBeVisible();
  });

  it('should edit profile', async () => {
    await element(by.id('edit-profile-button')).tap();
    await expect(element(by.id('edit-profile-screen'))).toBeVisible();
    await element(by.id('input-name')).typeText('New Name');
    await element(by.id('save-profile')).tap();
    await expect(element(by.text('New Name'))).toBeVisible();
  });
});
