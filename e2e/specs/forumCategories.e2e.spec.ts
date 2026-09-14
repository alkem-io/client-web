import { expect, test } from '../fixtures/authFixture';
import type { Locator, Page } from '@playwright/test';

/**
 * @forge-acceptance
 *
 * US1 — "A visitor browses the forum's four consolidated category groups"
 * and US4 — "The former Help category reads as Q&A everywhere" (workspace
 * spec 060-forum-reorganisation, US1-AS1..AS6, US4-AS1..AS4). Label
 * assertions for US4 live in this file rather than a fourth spec, per
 * repos.yaml — they're one nav-entry check away from US1-AS1's own walk.
 *
 * This file creates its own fixture posts via the UI rather than depending on
 * pre-seeded external state (see quickstart.md "Fixture for acceptance
 * walks" and forumRecategorise.e2e.spec.ts's header comment for the same
 * rationale).
 *
 * Scenarios intentionally NOT reproduced here:
 *   - US1-AS4 (createDiscussion(category: NEWSLETTER) as a member is refused)
 *     is an API-only assertion — verified live by the server gql-live track
 *     (probe 2).
 *   - US4-AS4 (every locale carries the new + legacy category keys, en HELP
 *     == "Q&A") is the jq-driven `contract:i18n-category-keys` check plus
 *     `common.parity.test.ts` — a build-time contract, not a browser walk.
 *   - The DE spot-check mentioned alongside US4-AS1 is skipped: this app's
 *     language selection is a consent-gated offer flow (see
 *     src/core/i18n/config.ts), not a URL/localStorage switch a Playwright
 *     walk can drive without emulating that offer; the EN assertion below
 *     stands in for it.
 *
 * Not part of `pnpm test` (vitest) — live-stack only, run via `pnpm test:e2e`
 * (see e2e/README.md) once ALKEMIO_BASE_URL / AUTH_TEST_HARNESS_* are set for
 * the target stack.
 */

const CATEGORY_LABEL = 'Category *';
const TITLE_LABEL = 'Title';
const BODY_PLACEHOLDER = 'Share your thoughts...';
const CREATE_TITLE = 'Create Discussion';
const CATEGORIES_NAV = 'Categories';

const CATEGORY_TIPS = 'Tips & Tricks';
const CATEGORY_NEWSLETTER = 'Newsletter';
const CATEGORY_RELEASES = 'Releases';
const CATEGORY_HELP = 'Q&A';
const CATEGORY_OTHER = 'Other';
const SHOW_ALL = 'Show all';

// The full active set this feature ships (US1-AS1) — the ForumDiscussionCategory
// enum's 8 live members (GENERAL/IDEAS/QUESTIONS/SHARING are stale i18n-only
// tombstones for historical notification payloads, not active categories —
// see forumDataMapper.tsx / graphql-schema.ts ForumDiscussionCategory).
const ALL_CATEGORY_LABELS = [
  'Working Challenge Centric',
  'Community Building',
  CATEGORY_HELP,
  CATEGORY_NEWSLETTER,
  CATEGORY_OTHER,
  'Platform Functionalities',
  CATEGORY_RELEASES,
  CATEGORY_TIPS,
];

function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function categoryNav(page: Page) {
  return page.getByRole('navigation', { name: CATEGORIES_NAV });
}

async function selectCategory(page: Page, scope: Locator, label: string) {
  await scope.getByRole('combobox', { name: CATEGORY_LABEL }).click();
  await page.getByRole('option', { name: label, exact: true }).click();
}

async function createDiscussion(page: Page, { title, category, body }: { title: string; category: string; body: string }) {
  await page.goto('/forum?dialog=new');
  const dialog = page.getByRole('dialog', { name: CREATE_TITLE });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: TITLE_LABEL }).fill(title);
  await selectCategory(page, dialog, category);
  await dialog.getByRole('textbox', { name: BODY_PLACEHOLDER }).fill(body);
  await dialog.getByRole('button', { name: CREATE_TITLE, exact: true }).click();

  await expect(dialog).toBeHidden();
  await page.waitForURL(/\/forum\/discussion\//);
  return page.url();
}

test.describe('forum category nav — active categories & Q&A relabel (US1, US4)', () => {
  test("US1-AS1 / US4-AS1 — the nav lists all 8 active categories plus Show all, each iconed and labelled, and Help reads 'Q&A'", async ({
    authedPage: page,
  }) => {
    await page.goto('/forum');
    const nav = categoryNav(page);
    await expect(nav).toBeVisible();

    const entries = nav.getByRole('button');
    await expect(entries).toHaveCount(ALL_CATEGORY_LABELS.length + 1); // + "Show all"

    await expect(nav.getByRole('button', { name: SHOW_ALL, exact: true })).toBeVisible();
    for (const label of ALL_CATEGORY_LABELS) {
      await expect(nav.getByRole('button', { name: label, exact: true })).toBeVisible();
    }

    // No raw i18n key ever leaks through (would look like "common.enums...").
    const navText = await nav.textContent();
    expect(navText).not.toMatch(/common\.enums|crd-forum:/);
  });

  test('US1-AS2 — an admin can create a post in Tips & Tricks and it appears on that category page', async ({
    authedPage: page,
  }) => {
    const title = uniqueTitle('US1-AS2 tips post');
    await createDiscussion(page, { title, category: CATEGORY_TIPS, body: 'A Tips & Tricks fixture post.' });

    await page.goto('/forum/tips-and-tricks');
    await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();
  });

  test('US1-AS3 — a non-admin never sees Releases or Newsletter in the create-dialog picker', async ({ secondUser }) => {
    const member = await secondUser();
    await member.page.goto('/forum?dialog=new');
    const dialog = member.page.getByRole('dialog', { name: CREATE_TITLE });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('combobox', { name: CATEGORY_LABEL }).click();
    await expect(member.page.getByRole('option', { name: CATEGORY_RELEASES, exact: true })).toHaveCount(0);
    await expect(member.page.getByRole('option', { name: CATEGORY_NEWSLETTER, exact: true })).toHaveCount(0);
    await expect(member.page.getByRole('option', { name: CATEGORY_TIPS, exact: true })).toBeVisible();
    await member.close();
  });

  // US1-AS4 — createDiscussion(category: NEWSLETTER) as a member is refused.
  // API-only; verified by the server gql-live track (probe 2).

  test('US1-AS5 — /forum/releases/latest redirects to the newest Releases post', async ({ authedPage: page }) => {
    const title = uniqueTitle('US1-AS5 release note');
    const postUrl = await createDiscussion(page, { title, category: CATEGORY_RELEASES, body: 'A release-notes fixture post.' });

    await page.goto('/forum/releases/latest');
    await expect(page).toHaveURL(postUrl);
    await expect(page.getByText(title)).toBeVisible();
  });

  test('US1-AS6 / US4-AS3 — /forum/help and /forum/other render their category pages exactly as before', async ({
    authedPage: page,
  }) => {
    await page.goto('/forum/help');
    await expect(categoryNav(page).getByRole('button', { name: CATEGORY_HELP, exact: true })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(page.getByText('Search is unavailable')).toHaveCount(0);

    await page.goto('/forum/other');
    await expect(categoryNav(page).getByRole('button', { name: CATEGORY_OTHER, exact: true })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test("US4-AS2 — a post filed under the relabelled category shows 'Q&A' as its category, and its permalink is unaffected", async ({
    authedPage: page,
  }) => {
    const title = uniqueTitle('US4-AS2 help post');
    const postUrl = await createDiscussion(page, { title, category: CATEGORY_HELP, body: 'A Q&A fixture post.' });

    await page.goto(postUrl);
    // See forumRecategorise.e2e.spec.ts (US2-AS7) for why the back-link href
    // is used as the category indicator: the detail page has no separate
    // text badge, and the category icon is aria-hidden.
    await expect(page.getByRole('link', { name: 'See all discussions in this category' })).toHaveAttribute(
      'href',
      '/forum/help'
    );

    await page.goto('/forum/help');
    await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();
    await page.getByRole('link', { name: title, exact: true }).click();
    await expect(page).toHaveURL(postUrl);
  });
});
