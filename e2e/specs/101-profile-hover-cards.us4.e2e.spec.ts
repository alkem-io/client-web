import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { type Browser, type BrowserContext, expect, type Page, test } from '@playwright/test';

/**
 * @forge-acceptance
 * workspace#101-profile-hover-cards — User Story 4: touch and keyboard keep working.
 *   US4-AS1  phone + touch: tapping a commenter's avatar opens the preview sheet instead of navigating, and
 *            its View Profile button lands on that member's profile
 *   US4-AS2  phone + touch: the same for a lead row in the space sidebar (mobile drawer)
 *   US4-AS3  desktop keyboard: Tab onto a commenter's avatar opens the hover card, Escape closes it and keeps
 *            focus on the link, Enter navigates to the profile
 *
 * On a touch screen the hover card is never rendered (spec FR-007, amended 2026-11-10), so the touch walks
 * also assert that no hover card mounts.
 *
 * Fixture (spec repos.yaml verification notes): a PUBLIC space with a post callout on which the member has
 * commented, and the member as a space lead. Everything is env-overridable:
 *   ALKEMIO_BASE_URL       Traefik origin                         (default http://localhost:3000)
 *   E2E_VIEWER_EMAIL       signed-in viewer; any registered user reads the PUBLIC space. Not admin by default,
 *                          because the US1/US5 walks mutate admin's settings (language, messaging)
 *                                                                (default content@alkem.io)
 *   E2E_USER_PASSWORD      viewer password                        (required)
 *   E2E_SPACE_NAMEID       fixture space                          (default hover-space)
 *   E2E_MEMBER_NAMEID      commenter and space lead               (default bob-hover)
 *   E2E_MEMBER_NAME        their display name                     (default "Bob Hover")
 *   E2E_MEMBER_TAGLINE     their tagline, shown on the card       (default "Builds bridges")
 *   E2E_POST_TITLE         post whose comments are walked         (default "Hover post")
 *   E2E_CHROMIUM_EXECUTABLE optional browser binary override
 *   E2E_EVIDENCE_DIR       when set, a screenshot is written per decisive assertion
 *
 * Headless only: this spec never requests a headed browser.
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';
const VIEWER = process.env.E2E_VIEWER_EMAIL || 'content@alkem.io';
const PASSWORD = process.env.E2E_USER_PASSWORD || '';
const SPACE = process.env.E2E_SPACE_NAMEID || 'hover-space';
const MEMBER = process.env.E2E_MEMBER_NAMEID || 'bob-hover';
const MEMBER_NAME = process.env.E2E_MEMBER_NAME || 'Bob Hover';
const MEMBER_TAGLINE = process.env.E2E_MEMBER_TAGLINE || 'Builds bridges';
const POST_TITLE = process.env.E2E_POST_TITLE || 'Hover post';
const EVIDENCE = process.env.E2E_EVIDENCE_DIR || '';

const PROFILE_URL = new RegExp(`/user/${MEMBER}/?(\\?.*)?$`);
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, locale: 'en-US' };
const DESKTOP = { viewport: { width: 1440, height: 900 }, locale: 'en-US' };

test.use({
  headless: true,
  launchOptions: process.env.E2E_CHROMIUM_EXECUTABLE ? { executablePath: process.env.E2E_CHROMIUM_EXECUTABLE } : {},
});
test.describe.configure({ mode: 'serial' });

// ---------------------------------------------------------------- helpers

async function shot(page: Page, name: string): Promise<void> {
  if (!EVIDENCE) return;
  mkdirSync(EVIDENCE, { recursive: true });
  await page.screenshot({ path: join(EVIDENCE, `${name}.png`) });
}

async function signedInContext(browser: Browser, options: Parameters<Browser['newContext']>[0]) {
  const context: BrowserContext = await browser.newContext(options);
  const page = await context.newPage();
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: /E-Mail/i }).fill(VIEWER);
  await page.getByLabel(/^Password/).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(url => !/login|self-service/.test(url.toString()), { timeout: 60_000 });
  return { context, page };
}

async function openSpace(page: Page): Promise<void> {
  await page.goto(`${BASE}/${SPACE}`);
  const cookies = page.getByRole('button', { name: 'Accept All Cookies' });
  // The banner is fixed to the bottom of the viewport and, on a phone, covers the tab-navigation Menu button.
  if (await cookies.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true, () => false)) await cookies.click();
  await expect(cookies).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

/** Expands the post's inline comments and returns the member's comment-author avatar link. */
async function memberCommentAvatar(page: Page) {
  const feed = page.getByRole('region', { name: 'Space content feed' });
  const post = feed.getByRole('heading', { name: POST_TITLE, level: 3 });
  await expect(post).toBeVisible();
  // The comments toggle that follows the post heading belongs to that post's card, so a reordered feed still
  // targets the right post.
  const toggle = post.locator(
    'xpath=following::button[@aria-label="Expand comments" or @aria-label="Collapse comments"][1]'
  );
  if ((await toggle.getAttribute('aria-label')) === 'Expand comments') await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const avatar = feed.getByRole('listitem').getByRole('link', { name: MEMBER_NAME, exact: true }).first();
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute('href', PROFILE_URL);
  return avatar;
}

const hoverCard = (page: Page) => page.locator('[data-slot="hover-card-content"]');

/** After a tap: the preview sheet is open on the member, the page has not navigated, then View Profile goes on. */
async function sheetThenProfile(page: Page, evidence: string): Promise<void> {
  const sheet = page.getByRole('dialog', { name: MEMBER_NAME });
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText(MEMBER_TAGLINE);
  await expect(hoverCard(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(PROFILE_URL);
  await shot(page, `${evidence}-sheet`);

  const viewProfile = sheet.getByRole('link', { name: 'View Profile' });
  await expect(viewProfile).toHaveAttribute('href', PROFILE_URL);
  await viewProfile.tap();
  await page.waitForURL(PROFILE_URL, { timeout: 30_000 });
  await expect(page.getByRole('heading', { name: MEMBER_NAME }).first()).toBeVisible();
  await shot(page, `${evidence}-profile`);
}

// ---------------------------------------------------------------- scenarios

test('US4-AS1 — phone tap on a commenter avatar opens the preview sheet, which leads to the profile', async ({
  browser,
}) => {
  expect(PASSWORD, 'E2E_USER_PASSWORD is required').not.toBe('');
  const { context, page } = await signedInContext(browser, PHONE);
  try {
    await openSpace(page);
    const avatar = await memberCommentAvatar(page);
    await avatar.scrollIntoViewIfNeeded();
    await shot(page, 'us4-as1-before-tap');

    await avatar.tap();
    await sheetThenProfile(page, 'us4-as1');
  } finally {
    await context.close();
  }
});

test('US4-AS2 — phone tap on a sidebar lead row opens the preview sheet, which leads to the profile', async ({
  browser,
}) => {
  expect(PASSWORD, 'E2E_USER_PASSWORD is required').not.toBe('');
  const { context, page } = await signedInContext(browser, PHONE);
  try {
    await openSpace(page);
    // On a phone the space sidebar (with the Space Leads block) lives in the tab-navigation "Menu" drawer.
    await page.getByRole('navigation', { name: 'Tab navigation' }).getByRole('button', { name: 'Menu' }).click();
    const sidebar = page.getByRole('dialog', { name: 'Menu' }).getByRole('navigation', { name: 'Space sidebar' });
    const leadRow = sidebar.getByRole('listitem').getByRole('link', { name: new RegExp(`^${MEMBER_NAME}\\b`) });
    await expect(leadRow).toBeVisible();
    await expect(leadRow).toHaveAttribute('href', PROFILE_URL);
    await shot(page, 'us4-as2-before-tap');

    await leadRow.tap();
    await sheetThenProfile(page, 'us4-as2');
  } finally {
    await context.close();
  }
});

test('US4-AS3 — keyboard focus opens the card, Escape closes it on the link, Enter navigates', async ({
  browser,
}) => {
  expect(PASSWORD, 'E2E_USER_PASSWORD is required').not.toBe('');
  const { context, page } = await signedInContext(browser, DESKTOP);
  try {
    await openSpace(page);
    const avatar = await memberCommentAvatar(page);
    await expect(hoverCard(page)).toHaveCount(0);

    // Reach the link by keyboard: focus the control immediately before it in tab order, then press Tab.
    const handle = await avatar.elementHandle();
    await page.evaluate(target => {
      const focusables = Array.from(
        document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, [tabindex]')
      ).filter(el => el.tabIndex >= 0 && el.offsetParent !== null);
      const index = focusables.indexOf(target as HTMLElement);
      focusables[index - 1]?.focus();
    }, handle);
    await page.keyboard.press('Tab');
    await expect(avatar).toBeFocused();

    // Card opens on focus.
    const card = hoverCard(page);
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('data-state', 'open');
    await expect(card.getByRole('link', { name: MEMBER_NAME, exact: true })).toBeVisible();
    await expect(card).toContainText(MEMBER_TAGLINE);
    await shot(page, 'us4-as3-focus-open');

    // Escape closes it and focus stays on the trigger link.
    await page.keyboard.press('Escape');
    await expect(card).toHaveCount(0);
    await expect(avatar).toBeFocused();
    await expect(page).not.toHaveURL(PROFILE_URL);
    await shot(page, 'us4-as3-escape-closed');

    // Enter follows the link.
    await page.keyboard.press('Enter');
    await page.waitForURL(PROFILE_URL, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: MEMBER_NAME }).first()).toBeVisible();
    await shot(page, 'us4-as3-enter-profile');
  } finally {
    await context.close();
  }
});
