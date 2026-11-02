import { type Browser, type Page } from '@playwright/test';
import { expect, test } from '../fixtures/authFixture';
import { FAKE_MEDIA_ARGS, GROUP_CONVERSATION_NAME, GroupCallPage, SYNC_TIMEOUT } from '../fixtures/groupCall';

/**
 * Calls between the web platform and stock Element Web (app.element.io), both
 * on the dev chat server. Assisted: needs a Playwright storage state of an
 * Element Web session already signed in to that chat server (Alkemio SSO)
 * whose user is a member of the group room.
 *   E2E_ELEMENT_SESSION      path to that storage-state JSON
 *   E2E_ELEMENT_URL          Element Web to drive (default https://app.element.io)
 *   E2E_GROUP_CONVERSATION_NAME  the room, as both clients name it
 */
const ELEMENT_SESSION = process.env.E2E_ELEMENT_SESSION;
const ELEMENT_URL = process.env.E2E_ELEMENT_URL ?? 'https://app.element.io';

test.use({ launchOptions: { args: FAKE_MEDIA_ARGS } });
test.describe.configure({ mode: 'serial', timeout: 240_000 });

const openElementRoom = async (browser: Browser): Promise<Page> => {
  const context = await browser.newContext({ storageState: ELEMENT_SESSION });
  const page = await context.newPage();
  await page.goto(ELEMENT_URL);
  await page.getByRole('treeitem', { name: GROUP_CONVERSATION_NAME }).click({ timeout: 60_000 });
  return page;
};

test.describe('group calls with Element', () => {
  test.skip(!ELEMENT_SESSION || !GROUP_CONVERSATION_NAME, 'needs E2E_ELEMENT_SESSION and E2E_GROUP_CONVERSATION_NAME');

  test('an Element user joins a call started on the web, and either side leaving is seen', async ({
    authedPage,
    browser,
  }) => {
    const web = new GroupCallPage(authedPage);
    await web.openGroupConversation();
    await web.startVideo.click();
    await web.joinFromLobby();

    const element = await openElementRoom(browser);
    await element.getByRole('button', { name: /^join$/i }).click({ timeout: SYNC_TIMEOUT });
    const elementCall = element.frameLocator('iframe[title]').last();
    await elementCall.getByTestId('lobby_joinCall').click({ timeout: 60_000 });

    await expect(web.callUi.getByTestId('videoTile')).toHaveCount(2, { timeout: 30_000 });
    await web.expectParticipants(2);

    await elementCall.getByTestId('incall_leave').click();
    await web.expectParticipants(1);
    await web.hangUpInCallUi();
    await element.context().close();
  });

  test('a call started in Element shows on the web and web members can join it', async ({ authedPage, browser }) => {
    const element = await openElementRoom(browser);
    await element.getByRole('button', { name: /video call/i }).first().click();
    const elementCall = element.frameLocator('iframe[title]').last();
    await elementCall.getByTestId('lobby_joinCall').click({ timeout: 60_000 });

    const web = new GroupCallPage(authedPage);
    await web.openGroupConversation();
    await expect(web.activeIndicator).toBeVisible({ timeout: SYNC_TIMEOUT });
    await web.expectParticipants(1);
    await web.joinVideo.click();
    await web.joinFromLobby();
    await expect(web.callUi.getByTestId('videoTile')).toHaveCount(2, { timeout: 30_000 });

    await web.hangUpInCallUi();
    await elementCall.getByTestId('incall_leave').click();
    await element.context().close();
  });
});
