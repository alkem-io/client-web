import type { Locator, Page } from '@playwright/test';
import { expect, test } from '../fixtures/authFixture';

/**
 * @forge-acceptance
 *
 * US2 — "Admin recategorises a post from within its edit dialog"
 * (workspace spec 060-forum-reorganisation, US2-AS1..AS7). High-risk story:
 * the edit dialog's category selector previously offered only the post's
 * current category (a one-option lock); this walk proves it now offers the
 * forum's full active list, that a recategorised post actually moves between
 * category listings, and that the move stays a pure metadata change (no
 * Matrix re-parenting, no notification fan-out, comments/permalink intact).
 *
 * This file creates its own fixture posts via the UI rather than depending on
 * pre-seeded external state — the acceptance walk is expected to run against
 * a freshly bootstrapped stack whose only forum content is what each test
 * creates for itself (see quickstart.md "Fixture for acceptance walks").
 *
 * Scenarios intentionally NOT reproduced here (covered elsewhere, per the
 * feature's contract check split):
 *   - US2-AS4 (typed refusal on updateDiscussion into a retired category) is
 *     an API-only assertion — verified live by the server gql-live track.
 *   - US2-AS3 (a post already sitting in a retired category still offers that
 *     category, plus the active ones) requires the ephemeral-stack-only psql
 *     drift seed described in quickstart.md/repos.yaml. It runs only when
 *     E2E_RETIRED_CATEGORY_POST_URL points at a post seeded that way; a run
 *     with the var unset skips loudly rather than silently passing.
 *
 * Not part of `pnpm test` (vitest) — live-stack only, run via `pnpm test:e2e`
 * (see e2e/README.md) once ALKEMIO_BASE_URL / AUTH_TEST_HARNESS_* are set for
 * the target stack.
 */

const CATEGORY_LABEL = 'Category *';
const TITLE_LABEL = 'Title';
const BODY_PLACEHOLDER = 'Share your thoughts...';
const CREATE_TITLE = 'Create Discussion';
const EDIT_TITLE = 'Edit Discussion';
const SAVE_CHANGES = 'Save Changes';
const EDIT_BUTTON = 'Edit';
const BACK_LINK_NAME = 'See all discussions in this category';
const NOTIFICATIONS_BUTTON = 'Notifications';

const CATEGORY_OTHER = 'Other';
const CATEGORY_TIPS = 'Tips & Tricks';

const RETIRED_CATEGORY_POST_URL = process.env.E2E_RETIRED_CATEGORY_POST_URL;
const RETIRED_CATEGORY_LABEL = process.env.E2E_RETIRED_CATEGORY_LABEL || CATEGORY_OTHER;

function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function selectCategory(page: Page, scope: Locator, label: string) {
  await scope.getByRole('combobox', { name: CATEGORY_LABEL }).click();
  await page.getByRole('option', { name: label, exact: true }).click();
}

/** Creates a discussion via the real create dialog and returns its permalink URL. */
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

async function openEditDialog(page: Page) {
  await page.getByRole('button', { name: EDIT_BUTTON, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: EDIT_TITLE });
  await expect(dialog).toBeVisible();
  return dialog;
}

function backLink(page: Page) {
  return page.getByRole('link', { name: BACK_LINK_NAME });
}

function unreadNotificationsBadge(page: Page) {
  // Header.tsx renders an sr-only "{{count}} unread notifications" span only
  // when the count is > 0 — its absence is the observable "no notification
  // fired" signal from the browser side.
  return page.getByText(/unread notifications?$/i);
}

test.describe('forum post recategorisation — edit dialog (US2)', () => {
  test("US2-AS1 — the edit dialog offers the forum's active categories, not just the current one", async ({
    authedPage: page,
  }) => {
    const postUrl = await createDiscussion(page, {
      title: uniqueTitle('US2-AS1 fixture'),
      category: CATEGORY_OTHER,
      body: 'Fixture post for the recategorisation acceptance walk.',
    });
    await page.goto(postUrl);

    const dialog = await openEditDialog(page);
    const categorySelect = dialog.getByRole('combobox', { name: CATEGORY_LABEL });
    await expect(categorySelect).toBeEnabled();

    await categorySelect.click();
    const optionCount = await page.getByRole('option').count();
    expect(optionCount).toBeGreaterThan(1);
    await expect(page.getByRole('option', { name: CATEGORY_TIPS, exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: CATEGORY_OTHER, exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test("US2-AS2 — saving a new category moves the post into that category's listing and out of the old one", async ({
    authedPage: page,
  }) => {
    const title = uniqueTitle('US2-AS2 move me');
    const postUrl = await createDiscussion(page, {
      title,
      category: CATEGORY_OTHER,
      body: 'Will be recategorised from Other to Tips & Tricks.',
    });
    await page.goto(postUrl);

    const dialog = await openEditDialog(page);
    await selectCategory(page, dialog, CATEGORY_TIPS);
    await dialog.getByRole('button', { name: SAVE_CHANGES, exact: true }).click();
    await expect(dialog).toBeHidden();

    await page.goto('/forum/tips-and-tricks');
    await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();

    await page.goto('/forum/other');
    await expect(page.getByRole('link', { name: title, exact: true })).toHaveCount(0);

    // The audit row (actor + from "other" + to "tips-and-tricks") is a
    // server-side write, checked via psql by the server track (gql-live
    // probe 5) — not observable from the browser and out of scope here.
  });

  test('US2-AS3 — a post carrying a retired category still offers it, alongside the active list', async ({
    authedPage: page,
  }) => {
    test.skip(
      !RETIRED_CATEGORY_POST_URL,
      'requires the ephemeral-stack-only psql drift seed (repos.yaml stack notes): set E2E_RETIRED_CATEGORY_POST_URL to a post already carrying a retired category, and E2E_RETIRED_CATEGORY_LABEL to its display label'
    );

    await page.goto(RETIRED_CATEGORY_POST_URL!);
    const dialog = await openEditDialog(page);
    const categorySelect = dialog.getByRole('combobox', { name: CATEGORY_LABEL });
    await categorySelect.click();

    await expect(page.getByRole('option', { name: RETIRED_CATEGORY_LABEL, exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: CATEGORY_TIPS, exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  // US2-AS4 — updateDiscussion into a non-active category returns a typed
  // refusal. API-only; verified by the server gql-live track (probe 5).

  test('US2-AS5 — a member sees no edit affordance on a post they do not own', async ({ authedPage: admin, secondUser }) => {
    const postUrl = await createDiscussion(admin, {
      title: uniqueTitle('US2-AS5 fixture'),
      category: CATEGORY_OTHER,
      body: "Admin-authored post; a member shouldn't see an edit action on it.",
    });

    const member = await secondUser();
    await member.page.goto(postUrl);
    await expect(member.page.getByRole('button', { name: EDIT_BUTTON, exact: true })).toHaveCount(0);
    await member.close();
  });

  test('US2-AS6 — recategorising a post produces no notification', async ({ authedPage: page }) => {
    const postUrl = await createDiscussion(page, {
      title: uniqueTitle('US2-AS6 silent move'),
      category: CATEGORY_OTHER,
      body: 'Recategorising this must not fire a notification.',
    });

    await page.goto('/forum');
    await expect(unreadNotificationsBadge(page)).toHaveCount(0);

    await page.goto(postUrl);
    const dialog = await openEditDialog(page);
    await selectCategory(page, dialog, CATEGORY_TIPS);
    await dialog.getByRole('button', { name: SAVE_CHANGES, exact: true }).click();
    await expect(dialog).toBeHidden();

    await page.goto('/forum');
    await expect(unreadNotificationsBadge(page)).toHaveCount(0);
  });

  test('US2-AS7 — comments and the permalink survive a recategorisation, and the category indicator updates', async ({
    authedPage: page,
  }) => {
    const title = uniqueTitle('US2-AS7 permalink stable');
    const postUrl = await createDiscussion(page, {
      title,
      category: CATEGORY_OTHER,
      body: 'Checking the permalink and comment thread survive a category change.',
    });

    const commentBody = `A durable comment ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Add a comment...' }).fill(commentBody);
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByText(commentBody)).toBeVisible();

    // The detail page carries no separate text badge for the current category
    // (see CrdDiscussionPage / ForumDiscussionDetail — the icon is
    // aria-hidden). The "back to category" link's href is the one visible,
    // stable proxy for "which category page this post now lives on".
    await expect(backLink(page)).toHaveAttribute('href', '/forum/other');

    const dialog = await openEditDialog(page);
    await selectCategory(page, dialog, CATEGORY_TIPS);
    await dialog.getByRole('button', { name: SAVE_CHANGES, exact: true }).click();
    await expect(dialog).toBeHidden();

    await expect(page).toHaveURL(postUrl);
    await expect(page.getByText(commentBody)).toBeVisible();
    await expect(backLink(page)).toHaveAttribute('href', '/forum/tips-and-tricks');
  });
});
