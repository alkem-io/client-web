import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { expect, test } from '../fixtures/authFixture';

/**
 * @forge-acceptance
 *
 * "Existing and new subspaces look exactly as before the upgrade" — the UI-observable
 * scenarios; the new-subspace case is covered by the platform-template read, since the
 * fixture subspace is created from that template.
 *
 * UI half of the acceptance walk /forge verified against the live stack. The data-only
 * scenarios (null/missing key, idempotency, orphans) are proven by the
 * throwaway-Postgres migration fixture run (see the forge evidence), not here.
 *
 * Fixture (the feature quickstart in the agents-hq workspace), all via env:
 *   E2E_ALPHA_URL           — an L1 subspace created from the platform subspace template
 *                             (post-migration => positional lists), with at least one nested L2 and
 *                             one posted community update; admin is a lead/admin.
 *   E2E_ALPHA2_URL          — an L2 subspace under it.
 *   E2E_BETA_SUBSPACE_ID    — (optional) an L1 whose phase 2 list was customized.
 *   E2E_L0_SPACE_ID         — (optional) the parent L0 space id (lists must equal the top-level Space defaults).
 * Actors: primary (admin, authedPage), secondary member (AUTH_TEST_HARNESS_EMAIL_2, a member of the
 * subspace without update rights) and an anonymous context (the L0/subspace must be PUBLIC).
 *
 * Not part of `pnpm test` (vitest) — live-stack only, `pnpm test:e2e`.
 */

const ALPHA_URL = process.env.E2E_ALPHA_URL;
const ALPHA2_URL = process.env.E2E_ALPHA2_URL;
const BETA_ID = process.env.E2E_BETA_SUBSPACE_ID;
const L0_ID = process.env.E2E_L0_SPACE_ID;
const BASE_URL = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';

const SIDEBAR_NAME = 'SubSpace sidebar';
const QUICK_ACTIONS = ['Community', 'Events', 'Recent Activity', 'Post Index'] as const;

const sidebar = (page: Page) => page.getByRole('complementary', { name: SIDEBAR_NAME });

async function expectBefore(first: Locator, second: Locator) {
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  const [a, b] = await Promise.all([first.elementHandle(), second.elementHandle()]);
  const precedes = await a!.evaluate(
    (x, y) => Boolean(x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING),
    b!
  );
  expect(precedes, 'widgets must render in the stored order').toBe(true);
}

/** Today's order: About this Subspace, Add Post, Quick Actions (4), then nested subspaces. */
async function expectTodaysSidebar(root: Locator, opts: { addPost: boolean; recentActivity: boolean; nested: boolean }) {
  const about = root.getByRole('button', { name: 'About this Subspace' });
  const quickNav = root.getByRole('navigation', { name: 'Quick Actions' });
  await expect(about).toBeVisible();
  if (opts.addPost) {
    const addPost = root.getByRole('button', { name: 'Add Post' });
    await expectBefore(about, addPost);
    await expectBefore(addPost, quickNav);
  } else {
    await expect(root.getByRole('button', { name: 'Add Post' })).toHaveCount(0);
    await expectBefore(about, quickNav);
  }
  let previous = quickNav.getByRole('button', { name: 'Community' });
  for (const name of QUICK_ACTIONS.slice(1)) {
    const button = quickNav.getByRole('button', { name });
    if (name === 'Recent Activity' && !opts.recentActivity) {
      await expect(button).toHaveCount(0);
      continue;
    }
    await expectBefore(previous, button);
    previous = button;
  }
  if (opts.nested) {
    await expectBefore(previous, root.getByRole('heading', { name: 'Subspaces' }));
  }
  // The subspace sidebar has no search field by default.
  await expect(root.getByRole('searchbox')).toHaveCount(0);
  await expect(root.getByRole('textbox')).toHaveCount(0);
}

async function gotoSubspace(page: Page, url: string) {
  await page.goto(url);
  const cookies = page.getByRole('button', { name: /Accept (all|All) Cookies/i });
  if (await cookies.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await cookies.click();
  }
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

async function gql(request: APIRequestContext, query: string, variables: Record<string, unknown> = {}) {
  const login = await request.post(`${BASE_URL}/api/auth/non-interactive-login`, {
    data: {
      email: process.env.AUTH_TEST_HARNESS_EMAIL || 'admin@alkem.io',
      password: process.env.AUTH_TEST_HARNESS_PASSWORD || 'password',
    },
  });
  test.skip(!login.ok(), 'non-interactive login unavailable on this stack — API probes skipped');
  const { api_token: token } = await login.json();
  const res = await request.post(`${BASE_URL}/api/private/non-interactive/graphql`, {
    headers: { authorization: `Bearer ${token}` },
    data: { query, variables },
  });
  expect(res.ok()).toBe(true);
  const body = await res.json();
  expect(body.errors, JSON.stringify(body.errors)).toBeUndefined();
  return body.data;
}

const STATES = `states { displayName sortOrder settings { sidebar } }`;
const rank = <T extends { sortOrder: number }>(states: T[]) => [...states].sort((a, b) => a.sortOrder - b.sortOrder);

const SUBSPACE_DEFAULT = [
  'INTENT', 'ABOUT', 'CREATE_POST', 'COMMUNITY', 'EVENTS', 'ACTIVITY', 'INDEX', 'SUBSPACE_LINKS', 'VIRTUAL_CONTRIBUTORS', 'UPDATES',
];
const TAB_2 = ['INTENT', 'CREATE_POST', 'SEARCH', 'APPLICATION_BUTTON', 'CONTACT_LEADS', 'ADD_USER', 'VIRTUAL_CONTRIBUTORS', 'GUIDELINES'];
const TAB_3 = ['INTENT', 'CREATE_SUBSPACE', 'CREATE_POST', 'SEARCH', 'APPLICATION_BUTTON'];
const GENERIC = ['INTENT', 'CREATE_POST', 'APPLICATION_BUTTON', 'SEARCH', 'INDEX'];
const L0_TAB_1 = ['INTENT', 'ABOUT', 'CREATE_POST', 'SEARCH', 'APPLICATION_BUTTON', 'SUBSPACE_LINKS', 'EVENTS', 'UPDATES'];

test.describe('subspace sidebar — untouched subspaces look as before (US2)', () => {
  test.skip(!ALPHA_URL, 'E2E_ALPHA_URL not set — no L1 fixture to walk');

  test('US2-AS1 — admin: expanded, collapsed rail and 400px drawer show today\'s widgets, no search', async ({ authedPage }) => {
    await gotoSubspace(authedPage, ALPHA_URL!);
    await expectTodaysSidebar(sidebar(authedPage), { addPost: true, recentActivity: true, nested: true });

    // Collapsed rail: Add Post icon + the four quick-action icons (+ nested-subspace tiles).
    await sidebar(authedPage).getByRole('button', { name: 'Collapse' }).click();
    const rail = sidebar(authedPage);
    await expect(rail.getByRole('button', { name: 'Expand' })).toBeVisible();
    await expect(rail.getByRole('button', { name: 'Add Post' })).toBeVisible();
    for (const name of QUICK_ACTIONS) {
      await expect(rail.getByRole('button', { name })).toBeVisible();
    }
    await expect(rail.getByRole('searchbox')).toHaveCount(0);

    // Mobile drawer.
    await authedPage.setViewportSize({ width: 400, height: 800 });
    await gotoSubspace(authedPage, ALPHA_URL!);
    await authedPage.getByRole('button', { name: 'Open menu' }).click();
    const drawer = authedPage.getByRole('dialog', { name: 'Menu' });
    await expectTodaysSidebar(drawer, { addPost: true, recentActivity: true, nested: true });
  });

  test('US2-AS1 — member (no update rights): same widgets, no editing entry points', async ({ secondUser }) => {
    const { page, close } = await secondUser();
    try {
      await gotoSubspace(page, ALPHA_URL!);
      await expectTodaysSidebar(sidebar(page), { addPost: true, recentActivity: true, nested: true });
      await expect(sidebar(page).getByRole('button', { name: 'Edit description' })).toHaveCount(0);
    } finally {
      await close();
    }
  });

  test('US2-AS1 — an L2 subspace renders today\'s sidebar too (no nested-subspaces section)', async ({ authedPage }) => {
    test.skip(!ALPHA2_URL, 'E2E_ALPHA2_URL not set');
    await gotoSubspace(authedPage, ALPHA2_URL!);
    await expectTodaysSidebar(sidebar(authedPage), { addPost: true, recentActivity: true, nested: false });
  });

  test('US2-AS9 — anonymous: same widgets minus Recent Activity, no error notice, no activity request', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const operations: string[] = [];
    page.on('request', request => {
      if (request.url().includes('graphql')) {
        operations.push(/"operationName":"([^"]+)"/.exec(request.postData() ?? '')?.[1] ?? '?');
      }
    });
    try {
      await gotoSubspace(page, ALPHA_URL!);
      await expectTodaysSidebar(sidebar(page), { addPost: false, recentActivity: false, nested: true });
      await expect(page.getByRole('alert')).toHaveCount(0);
      expect(operations.filter(o => /activityLogOnCollaboration/i.test(o))).toEqual([]);
    } finally {
      await context.close();
    }
  });
});

test.describe('subspace sidebar — stored lists (US2 data reads)', () => {
  test('US2-AS8/AS4 — the platform subspace template carries the positional lists in positions 1-5', async ({ request }) => {
    const data = await gql(
      request,
      `{ platform { templatesManager { templateDefaults { type template { contentSpace { level collaboration { innovationFlow { ${STATES} } } } } } } } }`
    );
    const defaults = data.platform.templatesManager.templateDefaults as Array<{
      type: string;
      template: { contentSpace: { level: string; collaboration: { innovationFlow: { states: Array<{ sortOrder: number; settings: { sidebar: string[] } }> } } } };
    }>;
    const subspaceTemplate = defaults.find(d => d.type === 'PLATFORM_SUBSPACE')!.template.contentSpace;
    expect(subspaceTemplate.level).toBe('L1');
    const lists = rank(subspaceTemplate.collaboration.innovationFlow.states).map(s => s.settings.sidebar);
    expect(lists.slice(0, 5)).toEqual([SUBSPACE_DEFAULT, TAB_2, TAB_3, GENERIC, GENERIC]);
    expect(lists[0]).not.toContain('SEARCH');

    // The platform L0 template is untouched.
    const l0 = defaults.find(d => d.type === 'PLATFORM_SPACE')!.template.contentSpace;
    expect(l0.level).toBe('L0');
    expect(rank(l0.collaboration.innovationFlow.states).map(s => s.settings.sidebar).slice(0, 4)).toEqual([
      L0_TAB_1,
      TAB_2,
      TAB_3,
      GENERIC,
    ]);
  });

  test('US2-AS3 — the L0 space flow keeps the 055 default lists', async ({ request }) => {
    test.skip(!L0_ID, 'E2E_L0_SPACE_ID not set');
    const data = await gql(request, `query($id: UUID!) { lookup { space(ID: $id) { collaboration { innovationFlow { ${STATES} } } } } }`, {
      id: L0_ID,
    });
    const lists = rank(data.lookup.space.collaboration.innovationFlow.states as Array<{ sortOrder: number; settings: { sidebar: string[] } }>).map(
      s => s.settings.sidebar
    );
    expect(lists.slice(0, 4)).toEqual([L0_TAB_1, TAB_2, TAB_3, GENERIC]);
  });

  test('US2-AS2 — a customized L1 keeps its stored lists and renders its stored first list', async ({ request, authedPage }) => {
    test.skip(!BETA_ID, 'E2E_BETA_SUBSPACE_ID not set');
    const read = async () =>
      (
        await gql(request, `query($id: UUID!) { lookup { space(ID: $id) { nameID collaboration { innovationFlow { ${STATES} } } } } }`, {
          id: BETA_ID,
        })
      ).lookup.space as { nameID: string; collaboration: { innovationFlow: { states: Array<{ sortOrder: number; settings: { sidebar: string[] } }> } } };
    const before = await read();
    const phases = rank(before.collaboration.innovationFlow.states);
    expect(phases[1].settings.sidebar, 'phase 2 is the customized one').not.toEqual(TAB_2);

    const parent = process.env.E2E_BETA_URL;
    if (parent) {
      await gotoSubspace(authedPage, parent);
      await expect(sidebar(authedPage)).toBeVisible();
    }
    // Reading/opening the subspace never rewrites a stored list.
    expect(JSON.stringify(await read())).toBe(JSON.stringify(before));
  });
});
