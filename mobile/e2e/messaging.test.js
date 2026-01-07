const { device, expect, element, by } = require('detox');

describe('Messaging Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await element(by.id('tab-messages')).tap();
  });

  it('should show messages screen', async () => {
    await expect(element(by.id('messages-screen'))).toBeVisible();
  });

  it('should send a message', async () => {
    await element(by.id('input-message')).typeText('Hello!');
    await element(by.id('send-message')).tap();
    await expect(element(by.text('Hello!'))).toBeVisible();
  });
});
