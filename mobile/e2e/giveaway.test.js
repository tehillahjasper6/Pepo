const { device, expect, element, by } = require('detox');

describe('Giveaway Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await element(by.id('tab-giveaways')).tap();
  });

  it('should show giveaways screen', async () => {
    await expect(element(by.id('giveaways-screen'))).toBeVisible();
  });

  it('should create a giveaway', async () => {
    await element(by.id('create-giveaway-button')).tap();
    await expect(element(by.id('create-giveaway-screen'))).toBeVisible();
    await element(by.id('input-title')).typeText('Test Giveaway');
    await element(by.id('input-description')).typeText('Test Description');
    await element(by.id('submit-giveaway')).tap();
    await expect(element(by.text('Test Giveaway'))).toBeVisible();
  });
});
