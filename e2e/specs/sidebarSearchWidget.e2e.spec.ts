import { expect, test } from '../fixtures/authFixture';
import type { Page } from '@playwright/test';

/**
 * @forge-acceptance
 *
 * US1 — "Member searches and filters a tab's posts from the sidebar"
 * (workspace spec 055-sidebar-search-widget, US1-AS1..AS14).
 *
 * Reproduces, as a durable live-stack walk, the acceptance scenarios /forge
 * verified manually — screenshots in the agents-hq workspace under
 * `specs/055-sidebar-search-widget/forge/evidence-run1/US1/` (the regression
 * walk after the AS13 `<Trans>` literal-text fix, shipped in client-web
 * PR #10253). The server folded-callout-pagination fix that walk also
 * exercised was pulled out of the feature and is NOT on `develop` (see the
 * workspace's `forge/search-fold-pagination-followup/ISSUE-DRAFT.md`): the
 * widget dedupes callout ids client-side instead, and a short page may still
 * carry a continuation cursor.
 *
 * Fixture (see specs/055-sidebar-search-widget/quickstart.md):
 *   E2E_SPACE_URL              — a top-level Space whose tab-1 (Home) sidebar
 *                                 carries the `search` widget and whose feed
 *                                 holds: >= 12 posts containing "report", one
 *                                 post containing "climate" tagged E2E_TAG_1,
 *                                 posts tagged E2E_TAG_2 (+ others so the tag
 *                                 chips overflow into a "Show N more"
 *                                 affordance), and one post tagged the unsafe
 *                                 E2E_UNSAFE_TAG_NAME string.
 *   E2E_OTHER_SPACE_URL        — a *different* top-level Space whose tab-1
 *                                 (Home) sidebar also carries the `search`
 *                                 widget (US1-AS9). Required for AS9: the
 *                                 test is skipped when absent, never silently
 *                                 passed.
 *   E2E_OTHER_SPACE_UNIQUE_TERM — a term unique to a post in that other
 *                                 Space, used to prove the search never leaks
 *                                 across Spaces (US1-AS9): it must match >= 1
 *                                 item there (positive control) and 0 here.
 *
 * US1-AS14 (search backend unavailable) needs an operator/orchestrator lever
 * outside Playwright's reach (stopping the search backend container) and is
 * therefore gated behind E2E_SEARCH_BACKEND_DOWN=true, to be flipped only by
 * a driver script that stops the backend immediately before this file runs
 * and restarts it after — never part of the default matrix run.
 *
 * Not part of `pnpm test` (vitest) — live-stack only, run via `pnpm test:e2e`
 * (see e2e/README.md) once ALKEMIO_BASE_URL / AUTH_TEST_HARNESS_* /
 * E2E_SPACE_URL are set for the target stack.
 */

const SPACE_URL = process.env.E2E_SPACE_URL || '/search-space';

const SEARCH_TEXT = process.env.E2E_SEARCH_TEXT || 'climate';
const SEARCH_MATCH_TITLE = process.env.E2E_SEARCH_MATCH_TITLE || 'Climate policy brief';
const TAG_1 = process.env.E2E_TAG_1 || 'Policy';
const TAG_2 = process.env.E2E_TAG_2 || 'Solar';
const REPORT_TERM = process.env.E2E_REPORT_TERM || 'report';
const REPORT_COUNT = Number(process.env.E2E_REPORT_COUNT || 12);
const NO_MATCH_TERM = process.env.E2E_NO_MATCH_TERM || 'zzqx-nothing';
const OTHER_SPACE_URL = process.env.E2E_OTHER_SPACE_URL;
const OTHER_SPACE_UNIQUE_TERM = process.env.E2E_OTHER_SPACE_UNIQUE_TERM || 'zebra-unique-9271';
const UNSAFE_TAG_NAME = process.env.E2E_UNSAFE_TAG_NAME || '<img src=x onerror=alert(1)>';
const SEARCH_BACKEND_DOWN = process.env.E2E_SEARCH_BACKEND_DOWN === 'true';

const SEARCH_FIELD_NAME = 'Search posts';
const CLEAR_FILTERS_NAME = 'Clear filters';
const SIDEBAR_NAV_NAME = 'Space sidebar';

const TAB_HOME = 'Home';
const TAB_COMMUNITY = 'Community';
const TAB_SUBSPACES = 'Subspaces';
const TAB_KNOWLEDGE = 'Knowledge';

function sidebarNav(page: Page) {
  return page.getByRole('navigation', { name: SIDEBAR_NAV_NAME });
}

function searchField(page: Page) {
  return sidebarNav(page).getByRole('searchbox', { name: SEARCH_FIELD_NAME });
}

/**
 * Tag chips beyond the first two rows are revealed via a "Show N more"
 * disclosure whose contents are portalled (Radix Popover) to the end of
 * `document.body`, outside the `<nav aria-label="Space sidebar">` subtree —
 * so this is intentionally NOT scoped to sidebarNav(). Each tag name is
 * unique across the page (fixture and product invariant alike).
 */
function chip(page: Page, name: string) {
  return page.getByRole('button', { name, exact: true });
}

function clearFiltersButton(page: Page) {
  return sidebarNav(page).getByRole('button', { name: CLEAR_FILTERS_NAME });
}

/** Reveals overflow-collapsed chips (FR-005: "+N"/"Show N more" affordance). */
async function expandChipsIfCollapsed(page: Page) {
  const overflow = sidebarNav(page).getByRole('button', { name: /^Show \d+ more$/ });
  if (await overflow.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await overflow.click();
  }
}

/** The gray summary label's sentence — the strip's live region — or null when not rendered (FR-006/D-04). */
async function readLabel(page: Page): Promise<string | null> {
  const label = sidebarNav(page).getByRole('status').filter({ hasText: /related to/i }).first();
  if (!(await label.isVisible({ timeout: 2_000 }).catch(() => false))) return null;
  return (await label.textContent())?.trim() ?? null;
}

async function gotoTab(page: Page, tabName: string, spaceUrl: string = SPACE_URL) {
  await page.goto(spaceUrl);
  await page.getByRole('tab', { name: tabName }).click();
  await expect(page.getByRole('tab', { name: tabName })).toHaveAttribute('aria-selected', 'true');
  await expect(searchField(page)).toBeVisible();
}

/** Debounced live filter: fills the field and waits past the ~300 ms debounce + a settle beat. */
async function typeAndSettle(page: Page, text: string) {
  await searchField(page).fill(text);
  await page.waitForTimeout(1_500);
}

test.describe('sidebar search widget — member search & filter (US1)', () => {
  test.beforeEach(async ({ authedPage }) => {
    await gotoTab(authedPage, TAB_HOME);
  });

  test('US1-AS1 — live text search swaps to matching results with the search-only label', async ({
    authedPage: page,
  }) => {
    await typeAndSettle(page, SEARCH_TEXT);

    await expect(page.getByRole('link', { name: SEARCH_MATCH_TITLE, exact: true })).toBeVisible();
    await expect(page.getByText(new RegExp(`Quarterly ${REPORT_TERM}`, 'i'))).toHaveCount(0);

    const label = await readLabel(page);
    expect(label).toMatch(/^\d+ items? related to "/);
    expect(label).toContain(`"${SEARCH_TEXT}"`);
  });

  test('US1-AS2 — toggling tag chips filters by tag and updates the label', async ({ authedPage: page }) => {
    await expandChipsIfCollapsed(page);
    await chip(page, TAG_1).click();
    await page.waitForTimeout(1_500);

    let label = await readLabel(page);
    expect(label).toMatch(/^\d+ items? related to tag "/);
    expect(label).toContain(`"${TAG_1}"`);
    await expect(chip(page, TAG_1)).toHaveAttribute('aria-pressed', 'true');

    await chip(page, TAG_2).click();
    await page.waitForTimeout(1_500);

    label = await readLabel(page);
    expect(label).toMatch(/^\d+ items? related to tags "/);
    expect(label).toContain(`"${TAG_1}" + "${TAG_2}"`);
  });

  test('US1-AS3 — text and tags combine into one label', async ({ authedPage: page }) => {
    await expandChipsIfCollapsed(page);
    await chip(page, TAG_1).click();
    await page.waitForTimeout(300);
    await chip(page, TAG_2).click();
    await page.waitForTimeout(300);
    await typeAndSettle(page, SEARCH_TEXT);

    const label = await readLabel(page);
    expect(label).toMatch(/^\d+ items? related to "/);
    expect(label).toContain(`"${SEARCH_TEXT}" and tags`);
    expect(label).toContain(`"${TAG_1}" + "${TAG_2}"`);
  });

  test('US1-AS4 — the X clears text and every selected tag in one click', async ({ authedPage: page }) => {
    await expandChipsIfCollapsed(page);
    await chip(page, TAG_1).click();
    await page.waitForTimeout(300);
    await typeAndSettle(page, SEARCH_TEXT);
    await expect(clearFiltersButton(page)).toBeVisible();

    await clearFiltersButton(page).click();
    await page.waitForTimeout(1_000);

    await expect(searchField(page)).toHaveValue('');
    expect(await readLabel(page)).toBeNull();
    await expandChipsIfCollapsed(page);
    await expect(chip(page, TAG_1)).toHaveAttribute('aria-pressed', 'false');
  });

  test('US1-AS5 — a keystroke burst inside the debounce window settles into a single search, not one per key', async ({
    authedPage: page,
  }) => {
    const searchRequests: string[] = [];
    page.on('request', request => {
      if (request.method() !== 'POST' || !request.url().includes('/api/private/graphql')) return;
      const body = request.postDataJSON();
      const items = Array.isArray(body) ? body : [body];
      for (const item of items) {
        if (item?.operationName === 'FlowStateSearch') searchRequests.push(item.operationName);
      }
    });

    await searchField(page).click();
    for (const char of 'clima') {
      await searchField(page).pressSequentially(char, { delay: 30 });
    }
    await page.waitForTimeout(1_500);

    const label = await readLabel(page);
    expect(label).toContain('"clima"');
    // Five keystrokes, one debounced term → one page-1 request. An empty page
    // has no cursor, so a term with no matches issues exactly one. A SHORT
    // first page still carries a cursor (the server emits one for every
    // non-empty folded page) and the client eagerly confirms it with at most
    // ONE more request (a full first page waits for the sentinel instead), so
    // a term with matches issues one or two. Never one request per keystroke.
    if (label?.startsWith('0 items')) {
      expect(searchRequests.length).toBe(1);
    } else {
      expect(searchRequests.length).toBeGreaterThanOrEqual(1);
      expect(searchRequests.length).toBeLessThanOrEqual(2);
    }
  });

  test('US1-AS6 — a long multi-word query renders results or the empty state, never the error state', async ({
    authedPage: page,
  }) => {
    await typeAndSettle(page, 'this is a rather long search sentence that has exactly twelve words');
    await page.waitForTimeout(1_000);

    await expect(page.getByText('Search is unavailable')).toHaveCount(0);
  });

  test('US1-AS7 — the count reads "N+" while paging and the exact number once fully loaded', async ({
    authedPage: page,
  }) => {
    await typeAndSettle(page, REPORT_TERM);
    await page.waitForTimeout(1_000);

    const midLabel = await readLabel(page);
    expect(midLabel).toMatch(/^\d+\+ items related to/);

    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 3_000);
      await page.waitForTimeout(800);
    }
    await page.waitForTimeout(1_000);

    const finalLabel = await readLabel(page);
    expect(finalLabel).toMatch(new RegExp(`^${REPORT_COUNT} items related to`));
  });

  test('US1-AS8 — no matches renders the empty state and a "0 items" label', async ({ authedPage: page }) => {
    await typeAndSettle(page, NO_MATCH_TERM);
    await page.waitForTimeout(1_000);

    await expect(page.getByText('No matches')).toBeVisible();
    const label = await readLabel(page);
    expect(label).toMatch(/^0 items related to "/);
    expect(label).toContain(`"${NO_MATCH_TERM}"`);
  });

  test('US1-AS9 — a term unique to another Space never leaks into this Space\'s results', async ({
    authedPage: page,
  }) => {
    test.skip(!OTHER_SPACE_URL, 'E2E_OTHER_SPACE_URL not set — no second Space to prove the term exists in');

    // Positive control first: the term really matches something in the OTHER
    // Space. Without it, "0 items" here would also pass for a term that
    // matches nothing anywhere (a misspelt or unindexed fixture, or a stale
    // index) — and would keep passing if the Space scoping were deleted.
    await gotoTab(page, TAB_HOME, OTHER_SPACE_URL!);
    await typeAndSettle(page, OTHER_SPACE_UNIQUE_TERM);
    await page.waitForTimeout(1_000);
    const otherSpaceLabel = await readLabel(page);
    expect(otherSpaceLabel, 'the fixture term must match in the other Space').toMatch(/^[1-9]\d*\+? items? related to/);

    // Now the Space under test: the same term must match nothing.
    await gotoTab(page, TAB_HOME);
    await typeAndSettle(page, OTHER_SPACE_UNIQUE_TERM);
    await page.waitForTimeout(1_000);
    const label = await readLabel(page);
    expect(label).toMatch(/^0 items related to "/);
  });

  test('US1-AS10 — search state resets on tab switch and never leaks to the next tab', async ({
    authedPage: page,
  }) => {
    await typeAndSettle(page, SEARCH_TEXT);

    await page.getByRole('tab', { name: TAB_SUBSPACES }).click();
    await expect(page.getByRole('tab', { name: TAB_SUBSPACES })).toHaveAttribute('aria-selected', 'true');
    await expect(searchField(page)).toHaveValue('');

    await page.getByRole('tab', { name: TAB_HOME }).click();
    await expect(page.getByRole('tab', { name: TAB_HOME })).toHaveAttribute('aria-selected', 'true');
    await expect(searchField(page)).toHaveValue('');
    expect(await readLabel(page)).toBeNull();
  });

  test('US1-AS11 — the mobile drawer and the desktop sidebar share one search state', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 400, height: 800 } });
    const page = await context.newPage();
    const { LoginPage } = await import('../fixtures/loginPage');
    await new LoginPage(page).login();
    await page.goto(SPACE_URL);
    await page.waitForTimeout(1_500);

    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });
    const drawerSearchField = drawer.getByRole('searchbox', { name: SEARCH_FIELD_NAME });
    await drawerSearchField.fill(SEARCH_TEXT);
    await page.waitForTimeout(1_500);

    await drawer.getByRole('button', { name: 'Close' }).click({ force: true });
    await page.waitForTimeout(800);
    await expect(page.getByRole('link', { name: SEARCH_MATCH_TITLE, exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(drawerSearchField).toHaveValue(SEARCH_TEXT);
    await expect(drawer.getByRole('status').filter({ hasText: /related to/i }).first()).toBeVisible();

    await context.close();
  });

  test('US1-AS12 — the search field is on every tab\'s sidebar and no content-row search remains', async ({
    authedPage: page,
  }) => {
    for (const tab of [TAB_HOME, TAB_COMMUNITY, TAB_SUBSPACES, TAB_KNOWLEDGE]) {
      await gotoTab(page, tab);
      await expect(searchField(page)).toBeVisible();
      // FR-008: the sidebar widget is the only search entry point — no second
      // "Search posts" field/tag popover survives in the main content area.
      await expect(page.getByRole('searchbox', { name: SEARCH_FIELD_NAME })).toHaveCount(1);
    }
  });

  test('US1-AS13 — an unsafe tag name renders as literal text, never as markup', async ({ authedPage: page }) => {
    let dialogFired = false;
    page.on('dialog', async dialog => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await expandChipsIfCollapsed(page);
    await chip(page, UNSAFE_TAG_NAME).click();
    await page.waitForTimeout(1_500);

    const label = await readLabel(page);
    expect(label).toContain(`"${UNSAFE_TAG_NAME}"`);
    await expect(page.locator('img[onerror]')).toHaveCount(0);
    expect(dialogFired).toBe(false);
  });

  test('US1-AS14 — a downed search backend shows the retryable error state, no label, and keeps the typed text', async ({
    authedPage: page,
  }) => {
    test.skip(
      !SEARCH_BACKEND_DOWN,
      'E2E_SEARCH_BACKEND_DOWN not set — requires a driver that stops the search backend container before this file runs (no in-test infra lever)'
    );

    await searchField(page).fill(SEARCH_TEXT);
    await expect(page.getByText('Search is unavailable')).toBeVisible({ timeout: 20_000 });
    expect(await readLabel(page)).toBeNull();
    await expect(searchField(page)).toHaveValue(SEARCH_TEXT);
  });
});
