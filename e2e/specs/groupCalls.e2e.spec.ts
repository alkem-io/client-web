import { expect, test } from '../fixtures/authFixture';
import { FAKE_MEDIA_ARGS, GROUP_CONVERSATION_NAME, GroupCallPage, SYNC_TIMEOUT } from '../fixtures/groupCall';

/**
 * Group calls in the web platform, against an environment configured for
 * calls (dev). Requires:
 *   AUTH_TEST_HARNESS_EMAIL, AUTH_TEST_HARNESS_EMAIL_2  two Feature Beta Testers
 *   E2E_NON_BETA_EMAIL                                  a member without the role
 *   E2E_GROUP_CONVERSATION_NAME                         a group conversation all three belong to
 * The call UI gets a fake camera and microphone. Rows run in order: each
 * leaves the conversation without a call.
 */
test.use({ launchOptions: { args: FAKE_MEDIA_ARGS } });
test.describe.configure({ mode: 'serial', timeout: 180_000 });

test.describe('group calls', () => {
  test.skip(!GROUP_CONVERSATION_NAME, 'E2E_GROUP_CONVERSATION_NAME is not set');

  test('a beta tester starts a video call, keeps it across navigation, and hangs up', async ({ authedPage }) => {
    const a = new GroupCallPage(authedPage);
    await a.openGroupConversation();

    // Start controls in the group header.
    await expect(a.startAudio).toBeVisible({ timeout: SYNC_TIMEOUT });
    await expect(a.startVideo).toBeVisible();

    // Start video: the overlay opens on the call UI's device check, then joins with the camera on.
    await a.startVideo.click();
    await expect(a.overlay).toBeVisible();
    expect(await a.frameElement.getAttribute('src')).toMatch(/^\/element-call\/index\.html#\?.*intent=start_call(&|$)/);
    await a.joinFromLobby();
    await expect(a.callUi.getByTestId('incall_videomute')).toBeVisible();
    await a.expectParticipants(1);

    // The call survives in-app navigation: same overlay, same call UI.
    const src = await a.frameElement.getAttribute('src');
    await a.navigateWithinApp('/home');
    await expect(a.overlay).toBeVisible();
    expect(await a.frameElement.getAttribute('src')).toBe(src);
    await expect(a.callUi.getByTestId('incall_leave')).toBeVisible();

    // Hanging up inside the call UI closes the overlay without a prompt.
    await a.hangUpInCallUi();
    await expect(a.overlay).toBeHidden({ timeout: SYNC_TIMEOUT });
    await expect(authedPage.getByRole('alertdialog')).toBeHidden();
  });

  test('an audio call starts with the camera off; closing while joined asks first', async ({ authedPage }) => {
    const a = new GroupCallPage(authedPage);
    await a.openGroupConversation();
    await a.startAudio.click();
    expect(await a.frameElement.getAttribute('src')).toMatch(/intent=start_call_voice(&|$)/);
    await a.joinFromLobby();

    // Closing the overlay while in the call: confirm, cancel keeps the call, confirm leaves.
    await a.overlayClose.click();
    const confirm = authedPage.getByRole('alertdialog');
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Stay in call' }).click();
    await expect(a.overlay).toBeVisible();
    await expect(a.callUi.getByTestId('incall_leave')).toBeVisible();

    await a.overlayClose.click();
    await authedPage.getByRole('alertdialog').getByRole('button', { name: 'Leave call' }).click();
    await expect(a.overlay).toBeHidden({ timeout: SYNC_TIMEOUT });
    await expect(a.startAudio).toBeVisible({ timeout: SYNC_TIMEOUT });
  });

  test('closing from the device check closes at once', async ({ authedPage }) => {
    const a = new GroupCallPage(authedPage);
    await a.openGroupConversation();
    await a.startVideo.click();
    await expect(a.callUi.getByTestId('lobby_joinCall')).toBeVisible({ timeout: 30_000 });
    await a.overlayClose.click();
    await expect(a.overlay).toBeHidden();
    await expect(authedPage.getByRole('alertdialog')).toBeHidden();
  });

  test('another beta tester sees the running call, joins it, and the call ends when both leave', async ({
    authedPage,
    secondUser,
    thirdUser,
  }) => {
    const a = new GroupCallPage(authedPage);
    await a.openGroupConversation();
    await a.startVideo.click();
    await a.joinFromLobby();

    const bSession = await secondUser();
    const b = new GroupCallPage(bSession.page);
    await b.openGroupConversation();

    // Active state with the distinct-user count and a join control; no start controls.
    await expect(b.activeIndicator).toBeVisible({ timeout: SYNC_TIMEOUT });
    await b.expectParticipants(1);
    await expect(b.startVideo).toHaveCount(0);

    // A member without the role sees no call state at all.
    const cSession = await thirdUser();
    const c = new GroupCallPage(cSession.page);
    await c.openGroupConversation();
    await expect(cSession.page.getByTestId('call-controls')).toHaveCount(0);
    await expect(c.activeIndicator).toHaveCount(0);
    await cSession.close();

    // B joins: both tiles in both call UIs, and the count is 2 for both.
    await b.joinVideo.click();
    await expect(b.overlay).toBeVisible();
    expect(await b.frameElement.getAttribute('src')).toMatch(/intent=join_existing(&|$)/);
    await b.joinFromLobby();
    await expect(a.callUi.getByTestId('videoTile')).toHaveCount(2, { timeout: SYNC_TIMEOUT });
    await expect(b.callUi.getByTestId('videoTile')).toHaveCount(2, { timeout: SYNC_TIMEOUT });
    await a.expectParticipants(2);
    await b.expectParticipants(2);

    // Both leave: the header returns to the start controls.
    await b.hangUpInCallUi();
    await a.expectParticipants(1);
    await a.hangUpInCallUi();
    await expect(a.startVideo).toBeVisible({ timeout: SYNC_TIMEOUT });
    await expect(b.startVideo).toBeVisible({ timeout: SYNC_TIMEOUT });
    await bSession.close();
  });

  test('a call row in the conversation list carries the call badge while the call runs', async ({
    authedPage,
    secondUser,
  }) => {
    const a = new GroupCallPage(authedPage);
    await a.openGroupConversation();
    await a.startAudio.click();
    await a.joinFromLobby();

    const bSession = await secondUser();
    await bSession.page.getByRole('button', { name: 'Open chat' }).click();
    const row = bSession.page.getByRole('listitem').filter({ hasText: GROUP_CONVERSATION_NAME });
    await expect(row.getByTestId('call-list-badge')).toBeVisible({ timeout: SYNC_TIMEOUT });

    await a.hangUpInCallUi();
    await expect(row.getByTestId('call-list-badge')).toHaveCount(0, { timeout: SYNC_TIMEOUT });
    await bSession.close();
  });

  test('signing out ends the call and closes the overlay', async ({ authedPage }) => {
    const a = new GroupCallPage(authedPage);
    await a.openGroupConversation();
    await a.startAudio.click();
    await a.joinFromLobby();

    // In-app, so it is the sign-out that closes the overlay, not a page load.
    await a.navigateWithinApp('/logout');
    await expect(a.overlay).toHaveCount(0, { timeout: SYNC_TIMEOUT });
  });
});
