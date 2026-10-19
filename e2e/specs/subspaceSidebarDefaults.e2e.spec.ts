import type { Locator, Page } from '@playwright/test';
import { expect, test } from '../fixtures/authFixture';
import {
  FIXTURE_URLS,
  gql,
  missingBeta,
  missingCredentials,
  missingFixture,
  missingReadonlyUser,
  rankStates as rank,
  resolveFixtureIds,
} from '../fixtures/subspaceSidebarFixture';

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
 * Fixture and environment: see `e2e/fixtures/subspaceSidebarFixture.ts`. Alpha must be untouched
 * (its positional lists), have at least one nested L2 and one posted community update; Beta is the
 * customized L1. Actors: the admin (authedPage), the member without update rights (readonlyUser)
 * and an anonymous context. Without credentials or fixture the walks skip with the reason; a
 * failed login is a red test, never a skip.
 *
 * Not part of `pnpm test` (vitest) — live-stack only, `pnpm test:e2e`.
 */

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

const STATES = `states { id displayName sortOrder settings { sidebar } }`;
type StoredState = { id: string; sortOrder: number; settings: { sidebar: string[] } };
const SUBSPACE_DEFAULT = [
  'INTENT', 'ABOUT', 'CREATE_POST', 'COMMUNITY', 'EVENTS', 'ACTIVITY', 'INDEX', 'SUBSPACE_LINKS', 'VIRTUAL_CONTRIBUTORS', 'UPDATES',
];
const TAB_2 = ['INTENT', 'CREATE_POST', 'SEARCH', 'APPLICATION_BUTTON', 'CONTACT_LEADS', 'ADD_USER', 'VIRTUAL_CONTRIBUTORS', 'GUIDELINES'];
const TAB_3 = ['INTENT', 'CREATE_SUBSPACE', 'CREATE_POST', 'SEARCH', 'APPLICATION_BUTTON'];
const GENERIC = ['INTENT', 'CREATE_POST', 'APPLICATION_BUTTON', 'SEARCH', 'INDEX'];
const L0_TAB_1 = ['INTENT', 'ABOUT', 'CREATE_POST', 'SEARCH', 'APPLICATION_BUTTON', 'SUBSPACE_LINKS', 'EVENTS', 'UPDATES'];

/**
 * How each widget of the L1 subspace vocabulary shows up in the expanded sidebar of an admin
 * (lead/admin of the subspace). `always` widgets render whenever they are configured; the others
 * also depend on data (a description or leads, nested subspaces, a posted update, a VC), so they
 * are only checked for order when present and for absence when not configured. Stored values
 * outside the L1 vocabulary never render and have no marker.
 */
const L1_MARKERS: Record<string, { marker: (root: Locator) => Locator; always: boolean }> = {
  INTENT: { marker: r => r.getByRole('button', { name: 'Edit description', exact: true }), always: false },
  ABOUT: { marker: r => r.getByRole('button', { name: 'About this Subspace', exact: true }), always: true },
  CREATE_POST: { marker: r => r.getByRole('button', { name: 'Add Post', exact: true }), always: true },
  ADD_USER: { marker: r => r.getByRole('button', { name: 'Invite', exact: true }), always: true },
  CREATE_SUBSPACE: { marker: r => r.getByRole('button', { name: 'Create Subspace', exact: true }), always: true },
  SEARCH: { marker: r => r.getByLabel('Search posts', { exact: true }), always: true },
  SUBSPACE_LINKS: { marker: r => r.getByRole('heading', { name: 'Subspaces', exact: true }), always: false },
  COMMUNITY: { marker: r => r.getByRole('button', { name: 'Community', exact: true }), always: true },
  EVENTS: { marker: r => r.getByRole('button', { name: 'Events', exact: true }), always: true },
  INDEX: { marker: r => r.getByRole('button', { name: 'Post Index', exact: true }), always: true },
  UPDATES: { marker: r => r.getByRole('heading', { name: 'Updates', exact: true }), always: false },
  VIRTUAL_CONTRIBUTORS: { marker: r => r.getByText('Virtual Contributor', { exact: true }), always: false },
  ACTIVITY: { marker: r => r.getByRole('button', { name: 'Recent Activity', exact: true }), always: true },
};

/** A stored list as the L1 sidebar renders it: in-vocabulary values only, first occurrence wins. */
const resolveL1 = (stored: string[]) => [...new Set(stored.filter(v => v in L1_MARKERS))];
const alwaysRendered = (stored: string[]) => resolveL1(stored).filter(v => L1_MARKERS[v].always);

/** The sidebar shows exactly `stored` (resolved at L1): every configured widget that must render
 *  is there, every widget not configured is absent, and the present ones follow the stored order. */
async function expectRenderedList(root: Locator, stored: string[]) {
  const expected = resolveL1(stored);
  for (const value of alwaysRendered(stored)) {
    await expect(L1_MARKERS[value].marker(root), `${value} is configured, so it renders`).toBeVisible();
  }
  for (const value of Object.keys(L1_MARKERS).filter(v => !expected.includes(v))) {
    await expect(L1_MARKERS[value].marker(root), `${value} is not configured, so it does not render`).toHaveCount(0);
  }
  const present: Locator[] = [];
  for (const value of expected) {
    const marker = L1_MARKERS[value].marker(root);
    if ((await marker.count()) > 0) present.push(marker.first());
  }
  for (let i = 1; i < present.length; i++) {
    await expectBefore(present[i - 1], present[i]);
  }
}

test.describe('subspace sidebar — untouched subspaces look as before (US2)', () => {
  test.skip(!!missingFixture, missingFixture);

  test('US2-AS1 — admin: expanded, collapsed rail and 400px drawer show today\'s widgets, no search', async ({ authedPage }) => {
    await gotoSubspace(authedPage, FIXTURE_URLS.alpha);
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
    await gotoSubspace(authedPage, FIXTURE_URLS.alpha);
    await authedPage.getByRole('button', { name: 'Open menu' }).click();
    const drawer = authedPage.getByRole('dialog', { name: 'Menu' });
    await expectTodaysSidebar(drawer, { addPost: true, recentActivity: true, nested: true });
  });

  test('US2-AS1 — member (no update rights): same widgets, no editing entry points', async ({ readonlyUser }) => {
    test.skip(!!missingReadonlyUser, missingReadonlyUser);
    const { page, close } = await readonlyUser();
    try {
      await gotoSubspace(page, FIXTURE_URLS.alpha);
      await expectTodaysSidebar(sidebar(page), { addPost: true, recentActivity: true, nested: true });
      await expect(sidebar(page).getByRole('button', { name: 'Edit description' })).toHaveCount(0);
    } finally {
      await close();
    }
  });

  test('US2-AS1 — an L2 subspace renders today\'s sidebar too (no nested-subspaces section)', async ({ authedPage }) => {
    await gotoSubspace(authedPage, FIXTURE_URLS.alpha2);
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
      await gotoSubspace(page, FIXTURE_URLS.alpha);
      await expectTodaysSidebar(sidebar(page), { addPost: false, recentActivity: false, nested: true });
      await expect(page.getByRole('alert')).toHaveCount(0);
      expect(operations.filter(o => /activityLogOnCollaboration/i.test(o))).toEqual([]);
    } finally {
      await context.close();
    }
  });
});

test.describe('subspace sidebar — stored lists (US2 data reads)', () => {
  test.skip(!!missingCredentials, missingCredentials);

  test('US2-AS8/AS4 — the platform subspace template carries the positional lists in positions 1-5', async ({ request }) => {
    type TemplateDefault = {
      type: string;
      template: { contentSpace: { level: string; collaboration: { innovationFlow: { states: StoredState[] } } } };
    };
    const data = await gql<{ platform: { templatesManager: { templateDefaults: TemplateDefault[] } } }>(
      request,
      `{ platform { templatesManager { templateDefaults { type template { contentSpace { level collaboration { innovationFlow { ${STATES} } } } } } } } }`
    );
    const defaults = data.platform.templatesManager.templateDefaults;
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
    test.skip(!!missingFixture, missingFixture);
    const { l0 } = await resolveFixtureIds(request);
    const data = await gql<{ lookup: { space: { collaboration: { innovationFlow: { states: StoredState[] } } } } }>(
      request,
      `query($id: UUID!) { lookup { space(ID: $id) { collaboration { innovationFlow { ${STATES} } } } } }`,
      { id: l0 }
    );
    const lists = rank(data.lookup.space.collaboration.innovationFlow.states).map(s => s.settings.sidebar);
    expect(lists.slice(0, 4)).toEqual([L0_TAB_1, TAB_2, TAB_3, GENERIC]);
  });

  test('US2-AS2 — a customized L1 keeps its stored lists and renders its stored first list', async ({ request, authedPage }) => {
    const missing = missingFixture ?? missingBeta;
    test.skip(!!missing, missing);
    const { beta } = await resolveFixtureIds(request);
    type Beta = { nameID: string; collaboration: { innovationFlow: { states: StoredState[] } } };
    const read = async () =>
      (
        await gql<{ lookup: { space: Beta } }>(
          request,
          `query($id: UUID!) { lookup { space(ID: $id) { nameID collaboration { innovationFlow { ${STATES} } } } } }`,
          { id: beta }
        )
      ).lookup.space;
    const before = await read();
    const phases = rank(before.collaboration.innovationFlow.states);
    const first = phases[0].settings.sidebar;
    expect(phases[1].settings.sidebar, 'phase 2 is the customized one').not.toEqual(TAB_2);
    // The walk only proves something when the first list is told apart from the lists a wrong
    // resolution would render: phase 2's list and the generic tab list.
    for (const [name, other] of [
      ['phase 2', phases[1].settings.sidebar],
      ['generic', GENERIC],
    ] as const) {
      expect(alwaysRendered(first), `fixture: the first list must render differently from the ${name} list`).not.toEqual(
        alwaysRendered(other)
      );
    }

    await gotoSubspace(authedPage, FIXTURE_URLS.beta as string);
    await expectRenderedList(sidebar(authedPage), first);

    // Reading/opening the subspace never rewrites a stored list.
    expect(JSON.stringify(await read())).toBe(JSON.stringify(before));
  });
});
