import { type Browser, type BrowserContext, expect, type Page, test } from '@playwright/test';

/**
 * @forge-acceptance
 *
 * "Members use the configured subspace sidebar, including search" — the full set
 * of acceptance scenarios for that story.
 *
 * Reproduces, as a durable live-stack walk, the acceptance scenarios /forge
 * verified headlessly against the isolated forge stack. Screenshots of the
 * original walk live in the forge run's evidence folder in the agents-hq workspace.
 *
 * The walk mutates the first phase's sidebar list of the fixture subspaces
 * through the private non-interactive GraphQL endpoint (the same write the
 * Customize Sidebar dialog performs) and restores today's default list in
 * `afterAll`. It never touches the database.
 *
 * Fixture (the feature quickstart, "Fixture for the walks"):
 *   E2E_L0_NAMEID      — top-level Space nameID, PUBLIC privacy      (default us3-sidebar-space)
 *   E2E_ALPHA_NAMEID   — an L1 under it, created from the platform subspace
 *                        template; members may NOT create subspaces
 *                        (allowMembersToCreateSubspaces = false); its first
 *                        (active) phase holds a post containing "climate"
 *                        tagged Policy plus a post tagged Solar, and its
 *                        second phase has a name that differs from every
 *                        other phase                               (default alpha)
 *   E2E_ALPHA2_NAMEID  — an L2 under Alpha; its first (active) phase holds a
 *                        post containing "delta-unique-4471", its second phase
 *                        holds a different post                    (default alpha2)
 *   the L0's own phase named like Alpha's first phase holds a post containing
 *   "zebra-unique-9271" (search must not leak it into the subspace).
 *   Search ingest (`adminSearchIngestFromScratch`) must have run after seeding.
 *
 * Accounts (env, defaults for the forge stack):
 *   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD     — Space admin (also drives the API writes)
 *   E2E_MEMBER_EMAIL / E2E_MEMBER_PASSWORD   — a member of the L0, Alpha and Alpha-2
 *                                              without update rights
 *   E2E_SERVER_URL                           — server direct URL for the token mint (default http://localhost:4000)
 *
 * Deviation recorded for the unknown-widget scenario: the "unknown value" leg is exercised by
 * injecting a wire-valid-but-client-unknown value into the GraphQL *response*
 * (a value outside the server enum cannot traverse the API at all — the
 * server's read normalization strips it — so a raw-SQL value is lost by any
 * client write and is not a reachable producer).
 *
 * Not part of `pnpm test` (vitest) — live-stack only, run via `pnpm test:e2e`.
 */

const BASE_URL = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';
const SERVER_URL = process.env.E2E_SERVER_URL || 'http://localhost:4000';
const GRAPHQL_URL = `${BASE_URL}/api/private/non-interactive/graphql`;

const L0_NAMEID = process.env.E2E_L0_NAMEID || 'us3-sidebar-space';
const ALPHA_NAMEID = process.env.E2E_ALPHA_NAMEID || 'alpha';
const ALPHA2_NAMEID = process.env.E2E_ALPHA2_NAMEID || 'alpha2';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || process.env.AUTH_TEST_HARNESS_EMAIL || 'admin@alkem.io';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || process.env.AUTH_TEST_HARNESS_PASSWORD || 'password';
const MEMBER_EMAIL = process.env.E2E_MEMBER_EMAIL || 'us3member@alkem.io';
const MEMBER_PASSWORD = process.env.E2E_MEMBER_PASSWORD || 'Us3-Sidebar-Test-9271!';

const ALPHA_URL = `${BASE_URL}/${L0_NAMEID}/challenges/${ALPHA_NAMEID}`;
const ALPHA2_URL = `${ALPHA_URL}/opportunities/${ALPHA2_NAMEID}`;

/** Today's subspace default list — restored after the walk. */
const SUBSPACE_DEFAULT = [
  'INTENT',
  'ABOUT',
  'CREATE_POST',
  'COMMUNITY',
  'EVENTS',
  'ACTIVITY',
  'INDEX',
  'SUBSPACE_LINKS',
  'VIRTUAL_CONTRIBUTORS',
  'UPDATES',
];

const SIDEBAR_NAME = 'SubSpace sidebar';

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

type FlowState = { id: string; displayName: string; sortOrder: number };
type FlowFixture = { states: FlowState[] };
type Fixture = { alpha: FlowFixture; alpha2: FlowFixture };

async function mintToken(email: string, password: string): Promise<string> {
  const res = await fetch(`${SERVER_URL}/api/auth/non-interactive-login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`non-interactive login failed for ${email}: ${res.status}`);
  return ((await res.json()) as { api_token: string }).api_token;
}

let adminToken = '';

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ query, variables }),
  });
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length) throw new Error(body.errors.map(e => e.message).join('; '));
  return body.data as T;
}

const sortStates = (states: FlowState[]) =>
  [...states].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));

async function resolveFixture(): Promise<Fixture> {
  const flow = 'collaboration { innovationFlow { states { id displayName sortOrder } } }';
  const data = await gql<{
    spaces: {
      nameID: string;
      subspaces: { nameID: string; collaboration: { innovationFlow: { states: FlowState[] } }; subspaces: any[] }[];
    }[];
  }>(`{ spaces { nameID subspaces { nameID ${flow} subspaces { nameID ${flow} } } } }`);
  const l0 = data.spaces.find(s => s.nameID === L0_NAMEID);
  const alpha = l0?.subspaces.find(s => s.nameID === ALPHA_NAMEID);
  const alpha2 = alpha?.subspaces.find((s: { nameID: string }) => s.nameID === ALPHA2_NAMEID);
  if (!alpha || !alpha2) throw new Error('fixture subspaces not found — see the spec header');
  return {
    alpha: { states: sortStates(alpha.collaboration.innovationFlow.states) },
    alpha2: { states: sortStates(alpha2.collaboration.innovationFlow.states) },
  };
}

async function setSidebar(stateId: string, sidebar: string[]): Promise<void> {
  await gql(
    `mutation($d: UpdateInnovationFlowStateInput!) { updateInnovationFlowState(stateData: $d) { id settings { sidebar } } }`,
    { d: { innovationFlowStateID: stateId, settings: { sidebar } } }
  );
}

async function readSidebar(stateId: string, flowOwner: 'alpha' | 'alpha2'): Promise<string[]> {
  const data = await gql<{
    spaces: {
      nameID: string;
      subspaces: {
        nameID: string;
        collaboration: { innovationFlow: { states: { id: string; settings: { sidebar: string[] } }[] } };
        subspaces: {
          nameID: string;
          collaboration: { innovationFlow: { states: { id: string; settings: { sidebar: string[] } }[] } };
        }[];
      }[];
    }[];
  }>(`{ spaces { nameID subspaces { nameID collaboration { innovationFlow { states { id settings { sidebar } } } }
      subspaces { nameID collaboration { innovationFlow { states { id settings { sidebar } } } } } } } }`);
  const l0 = data.spaces.find(s => s.nameID === L0_NAMEID);
  const alpha = l0?.subspaces.find(s => s.nameID === ALPHA_NAMEID);
  const owner = flowOwner === 'alpha' ? alpha : alpha?.subspaces.find(s => s.nameID === ALPHA2_NAMEID);
  const state = owner?.collaboration.innovationFlow.states.find(s => s.id === stateId);
  if (!state) throw new Error('state not found for read-back');
  return state.settings.sidebar;
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto(BASE_URL);
  await acceptCookies(page);
  await page
    .getByRole('link', { name: /log ?in|sign ?in/i })
    .first()
    .click();
  await page.waitForURL(/.*login.*/);
  await page.getByRole('textbox', { name: /E-Mail/i }).fill(email);
  await page.getByRole('textbox', { name: /Password/i }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(/.*home.*/);
}

/** The consent banner may or may not show; `click` (unlike `isVisible`) honours its timeout. */
async function acceptCookies(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: /Accept (all|All) Cookies/i })
    .click({ timeout: 5_000 })
    .catch(() => undefined);
}

const dismissCookies = acceptCookies;

/** The GraphQL endpoint only — never the dev server's `graphql*.js` modules. */
const isGraphqlEndpoint = (url: URL) => url.pathname.endsWith('/graphql');

const sidebar = (page: Page) => page.getByRole('complementary', { name: SIDEBAR_NAME });
const searchField = (page: Page) => sidebar(page).getByRole('searchbox', { name: 'Search posts' });
const feedHeadings = (page: Page) => page.locator('main main').getByRole('heading', { level: 3 });

async function openSubspace(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await dismissCookies(page);
  await expect(sidebar(page)).toBeVisible();
}

// ---------------------------------------------------------------------------
// The walk
// ---------------------------------------------------------------------------

test.describe.configure({ mode: 'serial' });

test.describe('@forge-acceptance US3 — configured subspace sidebar', () => {
  let browserRef: Browser;
  let admin: BrowserContext;
  let member: BrowserContext;
  let anonymous: BrowserContext;
  let fx: Fixture;
  let alphaFirst: string;
  let alphaSecond: FlowState;
  let alpha2First: string;

  test.beforeAll(async ({ browser }) => {
    browserRef = browser;
    adminToken = await mintToken(ADMIN_EMAIL, ADMIN_PASSWORD);
    fx = await resolveFixture();
    alphaFirst = fx.alpha.states[0].id;
    alphaSecond = fx.alpha.states[1];
    alpha2First = fx.alpha2.states[0].id;

    admin = await browserRef.newContext({ viewport: { width: 1440, height: 1000 } });
    member = await browserRef.newContext({ viewport: { width: 1440, height: 1000 } });
    anonymous = await browserRef.newContext({ viewport: { width: 1440, height: 1000 } });
    const adminPage = await admin.newPage();
    await signIn(adminPage, ADMIN_EMAIL, ADMIN_PASSWORD);
    await adminPage.close();
    const memberPage = await member.newPage();
    await signIn(memberPage, MEMBER_EMAIL, MEMBER_PASSWORD);
    await memberPage.close();
  });

  test.afterAll(async () => {
    if (alphaFirst) await setSidebar(alphaFirst, SUBSPACE_DEFAULT);
    if (alpha2First) await setSidebar(alpha2First, SUBSPACE_DEFAULT);
    await Promise.all([admin?.close(), member?.close(), anonymous?.close()]);
  });

  test('US3-AS1 search filters the active phase of the subspace, never the parent’s phase', async () => {
    await setSidebar(alphaFirst, ['INTENT', 'ABOUT', 'CREATE_POST', 'SEARCH', 'COMMUNITY', 'INDEX']);
    const page = await member.newPage();
    await openSubspace(page, ALPHA_URL);

    await searchField(page).fill('climate');
    await expect(sidebar(page).getByRole('status')).toContainText(/1 item related to/);
    await expect(feedHeadings(page)).toHaveText(['Climate action plan']);
    // Chips list the active phase's tags.
    await expect(sidebar(page).getByRole('button', { name: 'Policy', exact: true })).toBeVisible();
    await expect(sidebar(page).getByRole('button', { name: 'Solar', exact: true })).toBeVisible();

    await searchField(page).fill('zebra-unique-9271');
    await expect(sidebar(page).getByRole('status')).toContainText(/0 items related to/);
    await expect(feedHeadings(page)).toHaveCount(0);
    await page.close();
  });

  test('US3-AS2 L2 search finds its phase post and a phase switch resets the search', async () => {
    await setSidebar(alpha2First, ['INTENT', 'ABOUT', 'SEARCH', 'COMMUNITY', 'INDEX']);
    const page = await member.newPage();
    await openSubspace(page, ALPHA2_URL);

    await searchField(page).fill('delta-unique-4471');
    await expect(sidebar(page).getByRole('status')).toContainText(/1 item related to/);
    await expect(feedHeadings(page)).toHaveText(['Delta report']);

    await page.getByRole('button', { name: `Switch to phase ${fx.alpha2.states[1].displayName}` }).click();
    await expect(searchField(page)).toHaveValue('');
    await expect(sidebar(page).getByRole('status')).toHaveCount(0);
    await expect(feedHeadings(page).first()).toBeVisible();
    await expect(feedHeadings(page)).not.toHaveText(['Delta report']);
    await page.close();
  });

  test('US3-AS3 permission gates are never granted by configuration', async () => {
    await setSidebar(alphaFirst, ['CREATE_POST', 'CREATE_SUBSPACE', 'ADD_USER', 'ACTIVITY']);
    const names = ['Add Post', 'Create Subspace', 'Invite', 'Recent Activity'];

    const anon = await anonymous.newPage();
    await openSubspace(anon, ALPHA_URL);
    await expect(sidebar(anon).getByRole('button', { name: 'Collapse' })).toBeVisible();
    for (const name of names) await expect(sidebar(anon).getByRole('button', { name })).toHaveCount(0);
    await anon.close();

    const mem = await member.newPage();
    await openSubspace(mem, ALPHA_URL);
    await expect(sidebar(mem).getByRole('button', { name: 'Add Post' })).toBeVisible();
    await expect(sidebar(mem).getByRole('button', { name: 'Recent Activity' })).toBeVisible();
    await expect(sidebar(mem).getByRole('button', { name: 'Create Subspace' })).toHaveCount(0);
    await expect(sidebar(mem).getByRole('button', { name: 'Invite' })).toHaveCount(0);
    await mem.close();

    const adm = await admin.newPage();
    await openSubspace(adm, ALPHA_URL);
    for (const name of names) await expect(sidebar(adm).getByRole('button', { name })).toBeVisible();
    await adm.close();
  });

  test('US3-AS4 collapsed rail and mobile drawer follow the configuration', async () => {
    await setSidebar(alphaFirst, ['COMMUNITY', 'INDEX', 'SEARCH']);
    const page = await admin.newPage();
    await openSubspace(page, ALPHA_URL);

    await sidebar(page).getByRole('button', { name: 'Collapse' }).click();
    await expect(sidebar(page).getByRole('button', { name: 'Expand' })).toBeVisible();
    await expect(sidebar(page).getByRole('button')).toHaveText(['', '', '']); // icon-only: Expand, Community, Post Index
    await expect(sidebar(page).getByRole('button', { name: 'Community' })).toBeVisible();
    await expect(sidebar(page).getByRole('button', { name: 'Post Index' })).toBeVisible();
    await expect(sidebar(page).getByRole('searchbox')).toHaveCount(0);

    await page.setViewportSize({ width: 400, height: 900 });
    await page.goto(ALPHA_URL);
    await dismissCookies(page);
    await page.getByRole('button', { name: 'Open menu' }).first().click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer.getByRole('button', { name: 'Community' })).toBeVisible();
    await expect(drawer.getByRole('button', { name: 'Post Index' })).toBeVisible();
    await expect(drawer.getByRole('searchbox', { name: 'Search posts' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Edit innovation flow' })).toBeVisible();
    await page.close();
  });

  test('US3-AS5 Quick Actions grouping follows list adjacency', async () => {
    const page = await member.newPage();
    await setSidebar(alphaFirst, ['COMMUNITY', 'EVENTS', 'ACTIVITY', 'INDEX']);
    await openSubspace(page, ALPHA_URL);
    const groups = sidebar(page).getByRole('navigation', { name: 'Quick Actions' });
    await expect(groups).toHaveCount(1);
    await expect(groups.getByRole('button')).toHaveText(['Community', 'Events', 'Recent Activity', 'Post Index']);

    await setSidebar(alphaFirst, ['COMMUNITY', 'SEARCH', 'INDEX']);
    await openSubspace(page, ALPHA_URL);
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0).getByRole('button')).toHaveText(['Community']);
    await expect(groups.nth(1).getByRole('button')).toHaveText(['Post Index']);
    const [first, field, second] = await Promise.all([
      groups.nth(0).boundingBox(),
      searchField(page).boundingBox(),
      groups.nth(1).boundingBox(),
    ]);
    expect(first && field && second && first.y < field.y && field.y < second.y).toBe(true);
    await page.close();
  });

  test('US3-AS6 top-level-only and unknown widgets are skipped on render and preserved on save', async () => {
    // (a) the L0 tab-1 list carries applicationButton, which is not subspace vocabulary.
    const l0Tab1 = ['INTENT', 'ABOUT', 'CREATE_POST', 'SEARCH', 'APPLICATION_BUTTON', 'SUBSPACE_LINKS', 'EVENTS', 'UPDATES'];
    await setSidebar(alphaFirst, l0Tab1);
    const mem = await member.newPage();
    await openSubspace(mem, ALPHA_URL);
    await expect(sidebar(mem).getByRole('button', { name: 'About this Subspace' })).toBeVisible();
    await expect(sidebar(mem).getByRole('button', { name: /apply|join/i })).toHaveCount(0);
    await mem.close();

    const adm = await admin.newPage();
    await adm.goto(`${ALPHA_URL}/settings/layout`);
    await dismissCookies(adm);
    await adm.getByRole('button', { name: 'Customize Sidebar' }).click();
    const dialog = adm.getByRole('dialog', { name: 'Layout: Sidebar' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('checkbox', { name: /apply/i })).toHaveCount(0);
    await dialog.getByRole('button', { name: /^Save$/ }).click();
    await expect(dialog).toHaveCount(0);
    expect(await readSidebar(alphaFirst, 'alpha')).toEqual(l0Tab1);

    // (b) a value this client does not know, served by the API, is skipped and carried at its index.
    const writes: { settings?: { sidebar?: string[] } }[] = [];
    adm.on('request', r => {
      if (r.method() !== 'POST' || !r.url().includes('graphql')) return;
      const body = JSON.parse(r.postData() ?? '{}');
      if (/UpdateInnovationFlowState/.test(body.operationName ?? '')) writes.push(body.variables);
    });
    await adm.route(isGraphqlEndpoint, async route => {
      if (route.request().method() !== 'POST') return route.continue();
      const body = JSON.parse(route.request().postData() ?? '{}');
      if (Array.isArray(body) || /UpdateInnovationFlowState/.test(body.operationName ?? '')) return route.continue();
      const response = await route.fetch();
      const json = await response.json();
      const inject = (node: unknown): void => {
        if (!node || typeof node !== 'object') return;
        const rec = node as { id?: string; settings?: { sidebar?: string[] } };
        if (rec.id === alphaFirst && Array.isArray(rec.settings?.sidebar)) rec.settings.sidebar.splice(2, 0, 'FUTURE_WIDGET');
        Object.values(rec).forEach(inject);
      };
      inject(json);
      await route.fulfill({ response, json });
    });
    await adm.goto(`${ALPHA_URL}/settings/layout`);
    await adm.getByRole('button', { name: 'Customize Sidebar' }).click();
    const dialog2 = adm.getByRole('dialog', { name: 'Layout: Sidebar' });
    await expect(dialog2).toBeVisible();
    const saveRequest = adm.waitForRequest(
      r => r.method() === 'POST' && /UpdateInnovationFlowState/.test(r.postData() ?? '')
    );
    await dialog2.getByRole('button', { name: /^Save$/ }).click();
    await saveRequest;
    expect(writes[0]?.settings?.sidebar?.[2]).toBe('FUTURE_WIDGET');
    expect(writes[0]?.settings?.sidebar).toContain('APPLICATION_BUTTON');
    await adm.close();
  });

  test('US3-AS7 fetch parity: only configured widgets issue requests', async () => {
    const collect = (page: Page, bag: string[]) =>
      page.on('request', r => {
        if (r.method() !== 'POST' || !r.url().includes('graphql')) return;
        const body = JSON.parse(r.postData() ?? '{}');
        for (const x of Array.isArray(body) ? body : [body]) bag.push(x.operationName ?? '?');
      });

    await setSidebar(alphaFirst, ['INTENT', 'ABOUT']);
    const bare: string[] = [];
    const page = await member.newPage();
    collect(page, bare);
    await openSubspace(page, ALPHA_URL);
    await expect(sidebar(page).getByRole('button', { name: 'About this Subspace' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    for (const op of ['communityUpdates', 'SpaceDashboardNavigationSubspaces', 'CalloutsSetTags', 'FlowStateSearch'])
      expect(bare, `unexpected ${op}`).not.toContain(op);
    await page.close();

    await setSidebar(alphaFirst, ['INTENT', 'ABOUT', 'SEARCH']);
    const withSearch: string[] = [];
    const page2 = await member.newPage();
    collect(page2, withSearch);
    await openSubspace(page2, ALPHA_URL);
    await expect(searchField(page2)).toBeVisible();
    await page2.waitForLoadState('networkidle');
    expect(withSearch.filter(op => op === 'CalloutsSetTags')).toHaveLength(1);
    expect(withSearch).not.toContain('FlowStateSearch');
    await page2.close();
  });

  test('US3-AS8 no flash of a default widget set while the flow loads', async () => {
    await setSidebar(alphaFirst, ['ABOUT', 'COMMUNITY', 'SEARCH']);
    const page = await member.newPage();
    await page.addInitScript(() => {
      const w = window as unknown as { __sets: string[] };
      w.__sets = [];
      const record = () => {
        const sb = document.querySelector('[aria-label="SubSpace sidebar"]');
        if (!sb) return;
        const labels = [...sb.querySelectorAll('button,input')]
          .map(e => (e.getAttribute('aria-label') ?? e.textContent ?? '').trim())
          .filter(Boolean);
        const sig = labels.join('|');
        if (w.__sets[w.__sets.length - 1] !== sig) w.__sets.push(sig);
      };
      new MutationObserver(record).observe(document, { subtree: true, childList: true, attributes: true });
    });
    await page.route(isGraphqlEndpoint, async route => {
      if (route.request().method() !== 'POST') return route.continue();
      const body = JSON.parse(route.request().postData() ?? '{}');
      if (body.operationName === 'InnovationFlowDetails') await new Promise(resolve => setTimeout(resolve, 3_000));
      await route.continue();
    });
    await page.goto(ALPHA_URL);
    await expect(searchField(page)).toBeVisible();
    const sets = await page.evaluate(() => (window as unknown as { __sets: string[] }).__sets);
    expect(sets.length).toBeGreaterThan(0);
    for (const sig of sets) {
      for (const forbidden of ['Add Post', 'Events', 'Recent Activity', 'Post Index', 'Invite', 'Create Subspace'])
        expect(sig, `flash of default widget "${forbidden}"`).not.toContain(forbidden);
    }
    await page.close();
  });

  test('US3-AS9 Add Post from the sidebar pre-selects the active phase (expanded and rail)', async () => {
    await setSidebar(alphaFirst, ['INTENT', 'CREATE_POST', 'COMMUNITY', 'INDEX']);
    const page = await member.newPage();
    await openSubspace(page, `${ALPHA_URL}?phase=${alphaSecond.id}`);
    await expect(page.getByRole('button', { name: `Switch to phase ${alphaSecond.displayName}` })).toBeVisible();

    const post = async (title: string) => {
      await sidebar(page).getByRole('button', { name: 'Add Post' }).click();
      const dialog = page.getByRole('dialog', { name: 'Create Post' });
      await expect(dialog).toBeVisible();
      await dialog.getByPlaceholder(/title/i).first().fill(title);
      const request = page.waitForRequest(r => r.method() === 'POST' && /CreateCallout/.test(r.postData() ?? ''));
      await dialog.getByRole('button', { name: /^Post$/i }).click();
      const variables = JSON.parse((await request).postData() ?? '{}').variables;
      await expect(dialog).toHaveCount(0);
      return variables.calloutData.classification.tagsets[0] as { name: string; tags: string[] };
    };

    expect(await post('US3-AS9 expanded post')).toEqual({ name: 'FLOW_STATE', tags: [alphaSecond.displayName] });
    await sidebar(page).getByRole('button', { name: 'Collapse' }).click();
    await expect(sidebar(page).getByRole('button', { name: 'Expand' })).toBeVisible();
    expect(await post('US3-AS9 rail post')).toEqual({ name: 'FLOW_STATE', tags: [alphaSecond.displayName] });
    await page.close();
  });
});
