import type { APIRequestContext, Browser, Locator, Page } from '@playwright/test';
import { expect, test } from '../fixtures/authFixture';

/**
 * @forge-acceptance
 * workspace#101-profile-hover-cards — US1: preview a member from their comment (client-web#9960).
 *
 * Desktop viewport, mouse hover, headless. Walks US1-AS1..AS9 on the inline feed post card's comments
 * (AS9 in the post's detail dialog).
 *
 * Fixture (seeded once per stack; see specs/101-profile-hover-cards/repos.yaml → verification.notes):
 *  - a PUBLIC space `HOVER_SPACE` (default `hover-space`) whose members include the two users below;
 *  - user Bob (`HOVER_BOB_NAME`, default `Bob Hover`): city Utrecht, country NL, tagline "Builds bridges",
 *    keywords `climate`, `governance`;
 *  - user Cara (`HOVER_CARA_NAME`, default `Cara Hover`): no tagline, no keywords;
 *  - a published post callout `HOVER_POST_TITLE` (default `Hover post`) commented on by Bob, Cara and the viewer.
 *  The viewer is a dedicated member account whose UI language is English (sharing the platform admin with
 *  walks that switch its language makes the role/name locators flaky).
 *
 * Env: ALKEMIO_BASE_URL (default http://localhost:3000), AUTH_TEST_HARNESS_EMAIL / AUTH_TEST_HARNESS_PASSWORD
 * (the viewer), HOVER_BOB_EMAIL / HOVER_BOB_PASSWORD (US1-AS3 toggles Bob's chat setting through the
 * non-interactive login and restores it), HOVER_EVIDENCE_DIR (optional screenshot directory),
 * E2E_CHROMIUM_EXECUTABLE (optional browser binary). Never runs headed.
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';
const SPACE_NAMEID = process.env.HOVER_SPACE || 'hover-space';
const POST_TITLE = process.env.HOVER_POST_TITLE || 'Hover post';
const BOB = process.env.HOVER_BOB_NAME || 'Bob Hover';
const CARA = process.env.HOVER_CARA_NAME || 'Cara Hover';
const BOB_NAMEID = process.env.HOVER_BOB_NAMEID || 'bob-hover';
const BOB_EMAIL = process.env.HOVER_BOB_EMAIL || 'bob.hover@alkem.io';
const BOB_PASSWORD = process.env.HOVER_BOB_PASSWORD;
const EVIDENCE = process.env.HOVER_EVIDENCE_DIR;
const SPACE_URL = `${BASE}/${SPACE_NAMEID}`;

test.use({
  viewport: { width: 1440, height: 900 },
  ...(process.env.E2E_CHROMIUM_EXECUTABLE
    ? { launchOptions: { executablePath: process.env.E2E_CHROMIUM_EXECUTABLE } }
    : {}),
});
test.describe.configure({ mode: 'serial' });

const card = (page: Page): Locator => page.locator('[data-slot=hover-card-content]');
const messageButton = (page: Page): Locator => card(page).getByRole('button', { name: 'Message', exact: true });

const evidence = async (page: Page, name: string) => {
  if (EVIDENCE) await page.screenshot({ path: `${EVIDENCE}/${name}.png` });
};

/** The inline feed card of the fixture post, with its comments expanded. */
const openFeedComments = async (page: Page): Promise<Locator> => {
  await page.goto(SPACE_URL);
  const feed = page.getByRole('region', { name: 'Space content feed' });
  const post = feed
    .locator('div')
    .filter({ has: page.getByRole('heading', { name: POST_TITLE, exact: true }) })
    .filter({ has: page.getByRole('button', { name: /^(Expand|Collapse) comments$/ }) })
    .last();
  await expect(post.getByRole('button', { name: /^(Expand|Collapse) comments$/ })).toBeVisible();
  const expand = post.getByRole('button', { name: 'Expand comments' });
  if (await expand.isVisible()) await expand.click();
  const comments = post.getByRole('list').filter({ has: page.getByRole('listitem') }).first();
  await expect(comments.getByRole('link', { name: BOB, exact: true })).toBeVisible();
  return comments;
};

const hoverOpen = async (page: Page, trigger: Locator) => {
  await trigger.hover();
  await expect(card(page)).toBeVisible();
};

/** Move the pointer to a corner far from any trigger and wait for the card to unmount. */
const leave = async (page: Page) => {
  await page.mouse.move(5, 895, { steps: 5 });
  await expect(card(page)).toHaveCount(0);
};

const viewerConversationsWith = async (request: APIRequestContext, userId: string) => {
  const res = await request.post(`${BASE}/api/private/graphql`, {
    data: { query: '{ me { conversations { conversations { members { id } room { type messagesCount } } } } }' },
  });
  const body = await res.json();
  expect(body.errors, JSON.stringify(body.errors)).toBeUndefined();
  return (
    body.data.me.conversations.conversations as {
      members: { id: string }[];
      room: { type: string; messagesCount: number };
    }[]
  ).filter(c => c.room.type === 'CONVERSATION_DIRECT' && c.members.some(m => m.id === userId));
};

const bobGql = async (request: APIRequestContext, query: string, variables: Record<string, unknown> = {}) => {
  if (!BOB_PASSWORD) throw new Error('HOVER_BOB_PASSWORD is required for US1-AS3');
  const login = await request.post(`${BASE}/api/auth/non-interactive-login`, {
    data: { email: BOB_EMAIL, password: BOB_PASSWORD },
  });
  expect(login.ok(), await login.text()).toBe(true);
  const { api_token } = await login.json();
  const res = await request.post(`${BASE}/api/private/non-interactive/graphql`, {
    data: { query, variables },
    headers: { Authorization: `Bearer ${api_token}` },
  });
  const body = await res.json();
  expect(body.errors, JSON.stringify(body.errors)).toBeUndefined();
  return body.data;
};

const setBobMessaging = async (request: APIRequestContext, allow: boolean) => {
  const me = await bobGql(request, '{ me { user { id } } }');
  await bobGql(
    request,
    'mutation($d: UpdateUserSettingsInput!) { updateUserSettings(settingsData: $d) { id settings { communication { allowOtherUsersToSendMessages } } } }',
    { d: { userID: me.me.user.id, settings: { communication: { allowOtherUsersToSendMessages: allow } } } }
  );
  return me.me.user.id as string;
};

test.describe('101 US1 — preview a member from their comment', () => {
  test('US1-AS1 hovering a commenter avatar shows avatar, name, location, tagline, keyword tags and Message', async ({
    authedPage: page,
  }) => {
    const comments = await openFeedComments(page);
    await hoverOpen(page, comments.getByRole('link', { name: BOB, exact: true }));
    const c = card(page);
    await expect(c.getByRole('img', { name: BOB })).toBeVisible();
    await expect(c.getByRole('link', { name: BOB, exact: true })).toHaveAttribute('href', new RegExp(`/user/${BOB_NAMEID}$`));
    await expect(c.getByText('Utrecht, NL', { exact: true })).toBeVisible();
    await expect(c.getByText('Builds bridges', { exact: true })).toBeVisible();
    await expect(c.getByRole('listitem')).toHaveText(['climate', 'governance']);
    await expect(messageButton(page)).toBeVisible();
    await evidence(page, 'US1-AS1');
  });

  test('US1-AS2 Message opens the chat panel on the direct conversation with Bob; no message is sent', async ({
    authedPage: page,
  }) => {
    const comments = await openFeedComments(page);
    await hoverOpen(page, comments.getByRole('link', { name: BOB, exact: true }));
    const created = page.waitForResponse(
      r => r.url().includes('graphql') && r.request().postDataJSON()?.operationName === 'CreateConversation'
    );
    await messageButton(page).click();
    expect((await (await created).json()).errors).toBeUndefined();
    const chat = page.getByRole('dialog', { name: BOB, exact: true });
    await expect(chat).toBeVisible();
    await expect(chat.getByRole('textbox')).toBeVisible();
    await evidence(page, 'US1-AS2');
    const request = page.context().request;
    const lookup = await request.post(`${BASE}/api/private/graphql`, {
      data: { query: `{ lookupByName { user(NAMEID: "${BOB_NAMEID}") } }` },
    });
    const bobId: string = (await lookup.json()).data.lookupByName.user;
    // dedup-or-create: exactly one direct conversation with Bob, and nothing was posted into it
    const conversations = await viewerConversationsWith(request, bobId);
    expect(conversations).toHaveLength(1);
    expect(conversations[0].room.messagesCount).toBe(0);
  });

  test('US1-AS3 Bob has chat disabled: his card opens without Message', async ({ authedPage: page, playwright }) => {
    // A cookie-less context: the viewer's session cookie must not shadow Bob's bearer token.
    const request = await playwright.request.newContext();
    await setBobMessaging(request, false);
    try {
      const comments = await openFeedComments(page);
      await hoverOpen(page, comments.getByRole('link', { name: BOB, exact: true }));
      await expect(card(page).getByRole('link', { name: BOB, exact: true })).toBeVisible();
      await expect(messageButton(page)).toHaveCount(0);
      await evidence(page, 'US1-AS3');
    } finally {
      await setBobMessaging(request, true);
      await request.dispose();
    }
  });

  test('US1-AS4 the viewer hovering their own avatar gets a card without Message', async ({ authedPage: page }) => {
    const viewer = await page.context().request.post(`${BASE}/api/private/graphql`, {
      data: { query: '{ me { user { profile { displayName } } } }' },
    });
    const viewerName: string = (await viewer.json()).data.me.user.profile.displayName;
    const comments = await openFeedComments(page);
    await hoverOpen(page, comments.getByRole('link', { name: viewerName, exact: true }));
    await expect(card(page).getByRole('link', { name: viewerName, exact: true })).toBeVisible();
    await expect(messageButton(page)).toHaveCount(0);
    await evidence(page, 'US1-AS4');
  });

  test('US1-AS5 a signed-out viewer of the public space gets a card without Message', async ({ browser }) => {
    const context = await (browser as Browser).newContext({ viewport: { width: 1440, height: 900 } });
    try {
      const page = await context.newPage();
      const comments = await openFeedComments(page);
      await expect(page.getByRole('link', { name: /log ?in|sign ?in/i }).first()).toBeVisible(); // signed out
      await hoverOpen(page, comments.getByRole('link', { name: BOB, exact: true }));
      await expect(card(page).getByText('Builds bridges', { exact: true })).toBeVisible();
      await expect(messageButton(page)).toHaveCount(0);
      await evidence(page, 'US1-AS5');
    } finally {
      await context.close();
    }
  });

  test('US1-AS6 a member with no tagline and no keywords gets a shorter card without those rows', async ({
    authedPage: page,
  }) => {
    const comments = await openFeedComments(page);
    await hoverOpen(page, comments.getByRole('link', { name: BOB, exact: true }));
    const bobHeight = (await card(page).boundingBox())!.height;
    await leave(page);
    await hoverOpen(page, comments.getByRole('link', { name: CARA, exact: true }));
    const c = card(page);
    await expect(c.getByRole('link', { name: CARA, exact: true })).toBeVisible();
    await expect(c.locator('p')).toHaveCount(0); // no tagline row
    await expect(c.getByRole('list')).toHaveCount(0); // no tag row
    const caraHeight = (await c.boundingBox())!.height;
    expect(caraHeight).toBeLessThan(bobHeight);
    await evidence(page, 'US1-AS6');
  });

  test('US1-AS7 the card stays open while the pointer moves into it and closes when it leaves both', async ({
    authedPage: page,
  }) => {
    const comments = await openFeedComments(page);
    await hoverOpen(page, comments.getByRole('link', { name: BOB, exact: true }));
    const box = (await card(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
    await page.waitForTimeout(600); // longer than the 150 ms close delay
    await expect(card(page)).toBeVisible();
    await evidence(page, 'US1-AS7');
    await leave(page);
  });

  test('US1-AS8 clicking the name in the card navigates to the profile', async ({ authedPage: page }) => {
    const comments = await openFeedComments(page);
    await hoverOpen(page, comments.getByRole('link', { name: BOB, exact: true }));
    await card(page).getByRole('link', { name: BOB, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/user/${BOB_NAMEID}$`));
    await expect(page.getByRole('heading', { name: BOB }).first()).toBeVisible();
    await evidence(page, 'US1-AS8');
  });

  test('US1-AS9 inside the post detail dialog the card opens above the dialog, without Message, and is hoverable', async ({
    authedPage: page,
  }) => {
    await page.goto(SPACE_URL);
    const feed = page.getByRole('region', { name: 'Space content feed' });
    await feed.getByRole('link', { name: `Open ${POST_TITLE}`, exact: true }).click();
    const dialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: POST_TITLE }) });
    await expect(dialog).toBeVisible();
    const bobLink = dialog.getByRole('link', { name: BOB, exact: true });
    await expect(bobLink).toBeVisible();
    await hoverOpen(page, bobLink);
    await expect(card(page).getByText('Builds bridges', { exact: true })).toBeVisible();
    await expect(messageButton(page)).toHaveCount(0);
    // "visibly above the dialog": the topmost element at the card's centre belongs to the card
    const box = (await card(page).boundingBox())!;
    const onTop = await page.evaluate(
      ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[data-slot=hover-card-content]'),
      { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    );
    expect(onTop).toBe(true);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
    await page.waitForTimeout(500);
    await expect(card(page)).toBeVisible();
    await evidence(page, 'US1-AS9');
  });
});
