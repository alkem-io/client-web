import { expect, type FrameLocator, type Locator, type Page } from '@playwright/test';

/** The group conversation the call rows use; every test account must be a member. */
export const GROUP_CONVERSATION_NAME = process.env.E2E_GROUP_CONVERSATION_NAME ?? '';

/** Chromium switches that give the call UI a fake camera and microphone without a permission prompt. */
export const FAKE_MEDIA_ARGS = ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'];

/** How long a membership change may take to reach another client (one sync). */
export const SYNC_TIMEOUT = 15_000;

/**
 * The group-call surfaces of one signed-in page: the chat panel's header
 * controls, the call overlay, and the embedded call UI inside it.
 */
export class GroupCallPage {
  constructor(readonly page: Page) {}

  async openGroupConversation(name: string = GROUP_CONVERSATION_NAME): Promise<void> {
    const launcher = this.page.getByRole('button', { name: 'Open chat' });
    await expect(launcher).toBeVisible({ timeout: 30_000 });
    await launcher.click();
    await this.page.getByRole('listitem').filter({ hasText: name }).getByRole('button').first().click();
  }

  get startAudio(): Locator {
    return this.page.getByTestId('call-start-audio');
  }

  get startVideo(): Locator {
    return this.page.getByTestId('call-start-video');
  }

  get activeIndicator(): Locator {
    return this.page.getByTestId('call-active-indicator');
  }

  get participantCount(): Locator {
    return this.page.getByTestId('call-participant-count');
  }

  get joinVideo(): Locator {
    return this.page.getByTestId('call-join-video');
  }

  get joinAudio(): Locator {
    return this.page.getByTestId('call-join-audio');
  }

  get overlay(): Locator {
    return this.page.getByTestId('call-overlay');
  }

  get overlayClose(): Locator {
    return this.page.getByTestId('call-overlay-close');
  }

  get frameElement(): Locator {
    return this.overlay.locator('iframe');
  }

  get callUi(): FrameLocator {
    return this.page.frameLocator('[data-testid=call-overlay] iframe');
  }

  /** Passes the call UI's device check and waits until this user's own tile is shown. */
  async joinFromLobby(): Promise<void> {
    await this.callUi.getByTestId('lobby_joinCall').click({ timeout: 30_000 });
    await expect(this.callUi.getByTestId('videoTile').first()).toBeVisible({ timeout: 30_000 });
  }

  async hangUpInCallUi(): Promise<void> {
    await this.callUi.getByTestId('incall_leave').click();
  }

  /** Header state is read while the overlay covers it, so presence in the DOM is what counts. */
  async expectParticipants(count: number): Promise<void> {
    await expect(this.participantCount).toHaveText(String(count), { timeout: SYNC_TIMEOUT });
  }

  /** In-app navigation, the way a link click moves between pages: no reload, so a call survives it. */
  async navigateWithinApp(path: string): Promise<void> {
    await this.page.evaluate(target => {
      window.history.pushState({}, '', target);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
  }
}
