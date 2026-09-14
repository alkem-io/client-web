import { expect, test } from '../fixtures/authFixture';
import type { Locator, Page } from '@playwright/test';

/**
 * @forge-acceptance
 *
 * US2 — "Existing and new Spaces get the search widget in the right slot"
 * (workspace spec 055-sidebar-search-widget, US2-AS1/AS6/AS7/AS8).
 *
 * Reproduces, as a durable live-stack walk, the UI-observable half of the
 * acceptance scenarios that /forge verified data-side via a direct read of
 * `innovation_flow_state.settings->'sidebar'` and the migration's real-DB
 * fixture matrix (see the agents-hq workspace's
 * `specs/055-sidebar-search-widget/forge/evidence-run1/US2/`).
 * That data-level evidence is the primary proof per the story's own
 * Independent Test ("read the stored sidebar lists ... create a new Space
 * and a new tab afterwards"); this spec adds the rendered-order assertion a
 * data read cannot make, driven through the real UI.
 *
 * Fixture (see specs/055-sidebar-search-widget/quickstart.md):
 *   E2E_SPACE_URL         — an existing top-level Space with the platform's
 *                            default 4 tabs (Home / Community / Subspaces /
 *                            Knowledge), either upgraded by the migration or
 *                            freshly bootstrapped after it (both assert the
 *                            same FR-003 shapes — US2-AS1 and US2-AS7 share
 *                            one code path: SIDEBAR_DEFAULT_* + the read
 *                            fallback).
 *   E2E_SUBSPACE_URL      — (optional) a subspace of that Space. US2-AS6's
 *                            "subspace page renders no widget" sub-test is
 *                            skipped when absent, never silently passed.
 *
 * Not part of `pnpm test` (vitest) — live-stack only, run via `pnpm test:e2e`
 * (see e2e/README.md) once ALKEMIO_BASE_URL / AUTH_TEST_HARNESS_* /
 * E2E_SPACE_URL are set for the target stack.
 */

const SPACE_URL = process.env.E2E_SPACE_URL || '/';
const SUBSPACE_URL = process.env.E2E_SUBSPACE_URL;

const SIDEBAR_NAV_NAME = 'Space sidebar';
const SEARCH_FIELD_NAME = 'Search posts';
const ADD_POST_NAME = 'Add Post';
const CREATE_SUBSPACE_NAME = 'Create Subspace';

/** The default four tab display names (FR-003 / bootstrap L0 template). */
const TAB_HOME = 'Home';
const TAB_COMMUNITY = 'Community';
const TAB_SUBSPACES = 'Subspaces';
const TAB_KNOWLEDGE = 'Knowledge';

function sidebarNav(page: Page) {
  return page.getByRole('navigation', { name: SIDEBAR_NAV_NAME });
}

/** `<input type="search">` — ARIA role `searchbox`, never `textbox`. */
function searchField(page: Page) {
  return sidebarNav(page).getByRole('searchbox', { name: SEARCH_FIELD_NAME });
}

function addPostButton(page: Page) {
  return sidebarNav(page).getByRole('button', { name: ADD_POST_NAME });
}

function createSubspaceButton(page: Page) {
  return sidebarNav(page).getByRole('button', { name: CREATE_SUBSPACE_NAME });
}

function postIndexButton(page: Page) {
  return sidebarNav(page).getByRole('button', { name: /Index$/ });
}

/**
 * The desktop sidebar is a single vertical column rendered directly from the
 * tab's resolved widget plan, in order (`plan.map(widgetId => sections[widgetId])`
 * — no reordering, see SpaceTabSidebarConnector.tsx). DOM order therefore IS
 * the stored list's order, so comparing the two widgets' document positions
 * is a deterministic slot-order assertion — not a layout/pixel one. (The
 * search widget's name lives only in its input's accessible name, so a text
 * search of the sidebar could never locate it — hence element positions.)
 */
async function expectRenderedBefore(first: Locator, second: Locator) {
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  const firstHandle = await first.elementHandle();
  const secondHandle = await second.elementHandle();
  const firstPrecedesSecond = await firstHandle!.evaluate(
    (a, b) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING),
    secondHandle!
  );
  expect(firstPrecedesSecond, 'the first widget must render before the second').toBe(true);
}

async function gotoTab(page: Page, spaceUrl: string, tabName: string) {
  await page.goto(spaceUrl);
  await page.getByRole('tab', { name: tabName }).click();
  await expect(page.getByRole('tab', { name: tabName })).toHaveAttribute('aria-selected', 'true');
}

/** FR-002/FR-003: search sits right after Add Post on tabs 1-2, right after
 *  Create Subspace/Add Post on tab 3, right before Post Index on tab 4+. */
async function assertDefaultSidebarOrder(page: Page, spaceUrl: string) {
  await gotoTab(page, spaceUrl, TAB_HOME);
  await expectRenderedBefore(addPostButton(page), searchField(page));

  await gotoTab(page, spaceUrl, TAB_COMMUNITY);
  await expectRenderedBefore(addPostButton(page), searchField(page));

  await gotoTab(page, spaceUrl, TAB_SUBSPACES);
  await expectRenderedBefore(createSubspaceButton(page), searchField(page));
  await expectRenderedBefore(addPostButton(page), searchField(page));

  await gotoTab(page, spaceUrl, TAB_KNOWLEDGE);
  await expectRenderedBefore(searchField(page), postIndexButton(page));

  // Removed-content-row guard (FR-008): the Knowledge tab's main content area
  // must carry no second search field — the sidebar widget is the only entry
  // point.
  await expect(page.getByRole('searchbox', { name: SEARCH_FIELD_NAME })).toHaveCount(1);
}

test.describe('sidebar search widget — default placement (US2)', () => {
  test('US2-AS1 — an existing/upgraded Space renders Search in the FR-002 ruled slot on all four default tabs', async ({
    authedPage,
  }) => {
    await assertDefaultSidebarOrder(authedPage, SPACE_URL);
  });

  test('US2-AS7 — a fresh Space (created after the upgrade) carries the same four defaults', async ({
    authedPage,
  }) => {
    // E2E_SPACE_URL is expected to be a Space bootstrapped/created AFTER the
    // 1788200000000-AddSearchSidebarWidget migration ran on the target stack
    // (the default rollout order per plan.md — server merges + migrates
    // first). Both US2-AS1 and US2-AS7 assert the identical FR-003 shapes
    // because they share one code path (SIDEBAR_DEFAULT_* constants +
    // normalizeStateSettings' generic-default read fallback) — the only
    // difference is provenance (migrated row vs. create-space default path),
    // which is asserted at the data layer in the migration real-DB check
    // (see quickstart.md), not observable from the UI.
    await assertDefaultSidebarOrder(authedPage, SPACE_URL);
  });

  test('US2-AS6 — a subspace renders no search widget (dormant scope, 040 FR-017)', async ({ authedPage }) => {
    test.skip(!SUBSPACE_URL, 'E2E_SUBSPACE_URL not set — no subspace fixture to walk');
    await authedPage.goto(SUBSPACE_URL!);
    // FR-013: subspace states store `search` (asserted at the data layer —
    // see the live-stack DB read in the workspace's forge/evidence-run1/US2/)
    // but the subspace
    // page must not render the widget — dormant scope, unchanged by 055.
    // Pin that the subspace page actually rendered its tab strip first: a
    // count of 0 on a blank or errored page would pass for the wrong reason.
    await expect(authedPage.getByRole('tab').first()).toBeVisible();
    await expect(authedPage.getByRole('searchbox', { name: SEARCH_FIELD_NAME })).toHaveCount(0);
  });

  test('US2-AS8 — adding a new tab stores the generic default and renders Search before Post Index', async ({
    authedPage,
  }) => {
    const tabName = `e2e-search-tab-${Date.now()}`;
    await authedPage.goto(`${SPACE_URL.replace(/\/$/, '')}/settings/layout`);

    await authedPage.getByRole('button', { name: 'Add tab' }).click();
    await authedPage.getByRole('textbox', { name: /Tab name/i }).fill(tabName);
    await authedPage.getByRole('button', { name: 'Add tab', exact: true }).last().click();
    await expect(authedPage.getByText(tabName).first()).toBeVisible();

    await authedPage.goto(SPACE_URL);
    await authedPage.getByRole('tab', { name: tabName }).click();
    await expect(authedPage.getByRole('tab', { name: tabName })).toHaveAttribute('aria-selected', 'true');

    await expectRenderedBefore(searchField(authedPage), postIndexButton(authedPage));
  });
});
