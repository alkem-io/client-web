import { expect, type Locator, type Page } from '@playwright/test';
import { test } from '../fixtures/authFixture';
import {
  FIXTURE_URLS,
  missingFixture,
  missingReadonlyUser,
  type Phase,
  readPhases,
  resolveFixtureIds,
  SUBSPACE_DEFAULT as POSITIONAL_DEFAULT,
  setPhaseOrder,
  updatePhaseSettings,
} from '../fixtures/subspaceSidebarFixture';

/**
 * @forge-acceptance
 *
 * "Subspace admin customizes the subspace sidebar once for every phase" — the
 * full set of acceptance scenarios for that story.
 *
 * Reproduces, as a durable live-stack walk, the acceptance scenarios /forge
 * verified headlessly (evidence lives in the forge run's evidence folder).
 *
 * Fixture and environment: see `e2e/fixtures/subspaceSidebarFixture.ts` (Alpha is the L1, Alpha-2
 * the L2; the admin needs the update right on the Space, Alpha and Alpha-2). Without credentials
 * or fixture the walk skips with the reason; the no-entry-point scenario also needs the member
 * persona and is skipped when it is absent, never silently passed. The API probes (stored-list
 * read-backs, the deliberate preconditions of the L2 and hidden-first-phase scenarios) go through
 * the shared non-interactive GraphQL helper.
 *
 * Each test resets the first-phase list / visibility / phase order it depends on
 * through the API first, so the walk is order-independent. Not part of
 * `pnpm test` (vitest) — live-stack only, run via `pnpm test:e2e` (see
 * e2e/README.md).
 */

const L0_URL = FIXTURE_URLS.l0;
const L1_URL = FIXTURE_URLS.alpha;
const L2_URL = FIXTURE_URLS.alpha2;

const SIDEBAR_NAME = 'SubSpace sidebar';
const PHASES_NAV_NAME = 'Innovation flow phases';
const HELP_TEXT =
  "Choose which widgets appear in this subspace's sidebar, and in what order. This applies to the whole subspace — every phase shows the same set.";

/** Dialog label per stored widget value (existing editor labels). */
const LABEL: Record<string, string> = {
  INTENT: 'Intention & Leads',
  ABOUT: 'About this Space',
  CREATE_POST: 'Add Post',
  ADD_USER: 'Invite',
  CREATE_SUBSPACE: 'Create Subspace',
  SEARCH: 'Search',
  SUBSPACE_LINKS: 'Subspaces',
  COMMUNITY: 'Community',
  EVENTS: 'Upcoming Events',
  INDEX: 'Post Index',
  UPDATES: 'Latest Update',
  VIRTUAL_CONTRIBUTORS: 'Virtual Contributors',
  ACTIVITY: 'Recent Activity',
};

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

function sidebar(page: Page): Locator {
  return page.getByRole('complementary', { name: SIDEBAR_NAME }).first();
}

/** Interactive entries of a sidebar surface in DOM order (`TAG:label`). */
function sidebarItems(surface: Locator): Promise<string[]> {
  return surface.evaluate(el =>
    [...el.querySelectorAll('input,button,a,h3,nav')].map(
      e => `${e.tagName}:${e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent?.trim().slice(0, 40)}`
    )
  );
}

async function settingsLayout(page: Page, url: string) {
  await page.goto(`${url}/settings/layout`);
  await expect(page.getByRole('button', { name: /^Add (phase|tab)$/i })).toBeVisible();
}

async function openCustomizeSidebar(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Customize Sidebar' }).click();
  const dialog = page.getByRole('dialog', { name: 'Layout: Sidebar' });
  await expect(dialog).toBeVisible();
  return dialog;
}

function selectedWidgets(dialog: Locator): Promise<string[]> {
  return dialog
    .getByRole('checkbox', { checked: true })
    .evaluateAll(els => els.map(e => (e.getAttribute('aria-label') ?? '').replace('Toggle ', '')));
}

function unselectedWidgets(dialog: Locator): Promise<string[]> {
  return dialog
    .getByRole('checkbox', { checked: false })
    .evaluateAll(els => els.map(e => (e.getAttribute('aria-label') ?? '').replace('Toggle ', '')));
}

/**
 * dnd-kit keyboard drag: Space lifts, the arrow key is pressed until the polite live region
 * announces the item is over `targetId` (the first / left-most sortable, so it cannot overshoot),
 * Space drops. Awaiting the announcements replaces any fixed sleep.
 */
async function keyboardDrag(page: Page, handle: Locator, key: 'ArrowUp' | 'ArrowLeft', targetId: string) {
  // Each DndContext renders its own live region; read them all so the helper is context-agnostic.
  const announcements = async () => (await page.locator('[id^="DndLiveRegion"]').allTextContents()).join('|');
  const idle = await announcements();
  await handle.focus();
  await page.keyboard.press('Space');
  await expect.poll(announcements).not.toBe(idle); // lifted
  await expect
    .poll(async () => {
      const current = await announcements();
      if (!current.endsWith(`droppable area ${targetId}.`)) {
        // dnd-kit measures droppable rects just after pick-up; an early arrow press is a no-op, so re-press.
        await page.keyboard.press(key);
      }
      return announcements();
    })
    .toMatch(new RegExp(`droppable area ${targetId}\\.$`));
  await page.keyboard.press('Space');
  await expect.poll(announcements).toMatch(/dropped/i);
}

/** Records the GraphQL mutations the page sends (operation name + variables). */
function recordMutations(page: Page) {
  const sent: { operationName: string; variables: unknown }[] = [];
  page.on('request', request => {
    if (request.method() !== 'POST' || !/graphql/.test(request.url())) return;
    const body = request.postDataJSON?.();
    if (body && /^\s*mutation/.test(body.query ?? '')) {
      sent.push({ operationName: body.operationName, variables: body.variables });
    }
  });
  return sent;
}

/** SPA navigation (no document load), so a window marker proves "no reload". */
async function spaNavigate(page: Page, url: string) {
  await page.evaluate(target => {
    const u = new URL(target);
    history.pushState({}, '', u.pathname + u.search);
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }, url);
}

async function phaseLabels(page: Page): Promise<string[]> {
  return page
    .getByRole('navigation', { name: PHASES_NAV_NAME })
    .getByRole('button')
    .evaluateAll(els => els.map(e => e.getAttribute('aria-label') ?? ''));
}

async function columnOrder(page: Page): Promise<string[]> {
  return page
    .locator('#crd-main-content')
    .getByText(/^(Explore|Define|Brainstorm|Validate|Evaluate)$/)
    .allTextContents();
}

async function openPhaseLayoutDialog(page: Page, phaseName: string): Promise<Locator> {
  const column = page
    .locator('div')
    .filter({ has: page.getByText(phaseName, { exact: true }) })
    .filter({ has: page.getByRole('button', { name: 'Column actions' }) })
    .last();
  await column.getByRole('button', { name: 'Column actions' }).first().click();
  await page.getByRole('menuitem', { name: 'Layout' }).click();
  const dialog = page.getByRole('dialog', { name: `Layout: ${phaseName}` });
  await expect(dialog).toBeVisible();
  return dialog;
}

// ---------------------------------------------------------------------------

test.describe('subspace sidebar — admin customizes once for every phase (US1)', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(!!missingFixture, missingFixture);

  let l1Id: string;
  let l2Id: string;
  let originalOrder: string[] = [];
  let flowId = '';

  test.beforeAll(async ({ request }) => {
    ({ alpha: l1Id, alpha2: l2Id } = await resolveFixtureIds(request));
    const { flowId: id, phases } = await readPhases(request, l1Id);
    flowId = id;
    // The platform subspace template ships Explore, Define, Brainstorm, Validate, Evaluate; a previous
    // walk may have left them reordered, so pin that order when the fixture has those names.
    const canonical = ['Explore', 'Define', 'Brainstorm', 'Validate', 'Evaluate'].map(name =>
      phases.find(p => p.displayName === name)
    );
    originalOrder = (canonical.every(Boolean) ? (canonical as Phase[]) : phases).map(p => p.id);
  });

  /** Order-independence: restore phase order, visibility and the positional first-phase list. */
  test.beforeEach(async ({ request }) => {
    await setPhaseOrder(request, flowId, originalOrder);
    const { phases } = await readPhases(request, l1Id);
    for (const phase of phases) {
      await updatePhaseSettings(request, phase.id, { descriptionDisplayMode: 'EXPANDED', showPublishDetails: true });
    }
    await updatePhaseSettings(request, phases[0].id, { visible: true, sidebar: POSITIONAL_DEFAULT });
    const l2 = await readPhases(request, l2Id);
    await updatePhaseSettings(request, l2.phases[0].id, { visible: true, sidebar: POSITIONAL_DEFAULT });
  });

  test('US1-AS1 — Customize Sidebar sits beside Add Phase / Replace flow on L1 and L2, absent on the L0', async ({
    authedPage: page,
  }) => {
    for (const url of [L1_URL, L2_URL]) {
      await settingsLayout(page, url);
      const buttons = await page
        .locator('#crd-main-content button')
        .evaluateAll(els => els.map(e => e.textContent?.trim() || e.getAttribute('aria-label') || '').filter(Boolean));
      const iCustomize = buttons.indexOf('Customize Sidebar');
      expect(iCustomize, `Customize Sidebar on ${url}`).toBeGreaterThanOrEqual(0);
      expect(buttons.slice(iCustomize, iCustomize + 3)).toEqual([
        'Customize Sidebar',
        'Replace innovation flow',
        'Add phase',
      ]);
    }
    await page.goto(`${L0_URL}/settings/layout`);
    await expect(page.getByRole('button', { name: 'Add tab' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Customize Sidebar' })).toHaveCount(0);
  });

  test('US1-AS2 — dialog title, help text, widget-only section, first-phase pre-selection, 13/11 labels', async ({
    authedPage: page,
    request,
  }) => {
    for (const [url, id, vocabulary] of [
      [L1_URL, l1Id, 13],
      [L2_URL, l2Id, 11],
    ] as const) {
      const first = (await readPhases(request, id)).phases[0].settings.sidebar;
      await settingsLayout(page, url);
      const dialog = await openCustomizeSidebar(page);
      await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Layout: Sidebar');
      await expect(dialog.getByText(HELP_TEXT, { exact: true })).toBeVisible();
      await expect(dialog.getByRole('switch')).toHaveCount(0);

      const selected = await selectedWidgets(dialog);
      const unselected = await unselectedWidgets(dialog);
      expect(selected).toEqual(first.filter(v => v in LABEL && (id === l1Id || !['CREATE_SUBSPACE', 'SUBSPACE_LINKS'].includes(v))).map(v => LABEL[v]));
      expect(selected.length + unselected.length).toBe(vocabulary);
      await page.keyboard.press('Escape');
    }
  });

  test('US1-AS3 — remove Post Index, move Search to the top: every phase, rail and drawer, no reload', async ({
    authedPage: page,
    request,
  }) => {
    await settingsLayout(page, L1_URL);
    await page.evaluate(() => {
      (window as unknown as { __noReload: string }).__noReload = 'kept';
    });
    const dialog = await openCustomizeSidebar(page);
    await dialog.getByRole('checkbox', { name: 'Toggle Post Index' }).click();
    await dialog.getByRole('checkbox', { name: 'Toggle Search' }).click();
    await keyboardDrag(page, dialog.getByRole('button', { name: 'Reorder Search' }), 'ArrowUp', 'intent');
    const dialogOrder = await selectedWidgets(dialog);
    expect(dialogOrder[0]).toBe('Search');
    expect(dialogOrder).not.toContain('Post Index');

    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => (window as unknown as { __noReload?: string }).__noReload)).toBe('kept');

    const stored = (await readPhases(request, l1Id)).phases[0].settings.sidebar;
    expect(stored.map(v => LABEL[v])).toEqual(dialogOrder);

    await spaNavigate(page, L1_URL);
    await expect(sidebar(page)).toBeVisible();
    for (const label of await phaseLabels(page)) {
      await page.getByRole('button', { name: label }).click();
      await expect(page.getByRole('button', { name: label })).toHaveAttribute('aria-current', 'page');
      const items = await sidebarItems(sidebar(page));
      expect(items[0]).toBe('BUTTON:Collapse');
      expect(items[1]).toBe('INPUT:Search posts');
      expect(items.join('|')).not.toContain('Post Index');
    }
    // collapsed rail: Post Index gone, Search is expanded-only by design
    await page.getByRole('button', { name: 'Collapse', exact: true }).click();
    const rail = await sidebarItems(sidebar(page));
    expect(rail[0]).toBe('BUTTON:Expand');
    expect(rail.join('|')).not.toContain('Post Index');
    expect(rail.join('|')).not.toContain('Search');
    await page.getByRole('button', { name: 'Expand', exact: true }).click();
    // mobile drawer
    await page.setViewportSize({ width: 390, height: 800 });
    await page.getByRole('button', { name: 'Open menu' }).click();
    const drawer = await sidebarItems(page.getByRole('dialog', { name: 'Menu' }).getByRole('complementary'));
    expect(drawer[0]).toBe('INPUT:Search posts');
    expect(drawer.join('|')).not.toContain('Post Index');
    expect(await page.evaluate(() => (window as unknown as { __noReload?: string }).__noReload)).toBe('kept');
  });

  test('US1-AS4 — L2 hides Create Subspace / Subspaces but keeps their stored values', async ({
    authedPage: page,
    request,
  }) => {
    const first = (await readPhases(request, l2Id)).phases[0];
    await updatePhaseSettings(request, first.id, { sidebar: ['INTENT', 'CREATE_SUBSPACE', 'SUBSPACE_LINKS', 'INDEX'] });

    await settingsLayout(page, L2_URL);
    const dialog = await openCustomizeSidebar(page);
    expect(await selectedWidgets(dialog)).toEqual(['Intention & Leads', 'Post Index']);
    const offered = [...(await selectedWidgets(dialog)), ...(await unselectedWidgets(dialog))];
    expect(offered).not.toContain('Create Subspace');
    expect(offered).not.toContain('Subspaces');
    await dialog.getByRole('checkbox', { name: 'Toggle Search' }).click();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();

    expect((await readPhases(request, l2Id)).phases[0].settings.sidebar).toEqual([
      'INTENT',
      'CREATE_SUBSPACE',
      'SUBSPACE_LINKS',
      'INDEX',
      'SEARCH',
    ]);
    await page.goto(L2_URL);
    await expect(sidebar(page)).toBeVisible();
    const items = (await sidebarItems(sidebar(page))).join('|');
    expect(items).toContain('INPUT:Search posts');
    expect(items).toContain('Post Index');
    expect(items).not.toMatch(/Create Subspace|H3:Subspaces|Show all/);
  });

  test('US1-AS5 — a hidden first phase stays authoritative', async ({ authedPage: page, request }) => {
    const before = (await readPhases(request, l1Id)).phases;
    await updatePhaseSettings(request, before[0].id, { visible: false });

    await settingsLayout(page, L1_URL);
    const dialog = await openCustomizeSidebar(page);
    expect(await selectedWidgets(dialog)).toEqual(before[0].settings.sidebar.map(v => LABEL[v]));
    await dialog.getByRole('checkbox', { name: 'Toggle Invite' }).click();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();

    const after = (await readPhases(request, l1Id)).phases;
    expect(after[0].settings.visible).toBe(false);
    expect(after[0].settings.sidebar).toEqual([...before[0].settings.sidebar, 'ADD_USER']);
    expect(after[1].settings.sidebar).toEqual(before[1].settings.sidebar);

    await page.goto(L1_URL);
    await expect(sidebar(page)).toBeVisible();
    const items = await sidebarItems(sidebar(page));
    expect(items.join('|')).toContain('BUTTON:Invite');
    expect(items.join('|')).toContain('BUTTON:About this Subspace'); // first-phase list, not phase 2's
    expect(await phaseLabels(page)).not.toContain(`Switch to phase ${before[0].displayName}`);
  });

  test('US1-AS6 — the per-phase dialog never writes the sidebar, also right after a reorder', async ({
    authedPage: page,
    request,
  }) => {
    const before = (await readPhases(request, l1Id)).phases;
    await settingsLayout(page, L1_URL);
    const sent = recordMutations(page);

    // plain toggle on phase 2
    let dialog = await openPhaseLayoutDialog(page, before[1].displayName);
    await expect(dialog.getByText(/sidebar/i)).toHaveCount(0);
    await dialog.getByRole('switch', { name: 'Collapse Post descriptions' }).click();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect.poll(async () => (await readPhases(request, l1Id)).phases[1].settings.descriptionDisplayMode).toBe('COLLAPSED');
    expect((await readPhases(request, l1Id)).phases[1].settings.sidebar).toEqual(before[1].settings.sidebar);
    expect(sent.length).toBeGreaterThan(0);
    for (const m of sent) expect(JSON.stringify(m.variables).toLowerCase()).not.toContain('sidebar');

    // reorder via the Save bar, then toggle again on the phase now at position 2
    await keyboardDrag(
      page,
      page.getByRole('button', { name: 'Drag to reorder phase' }).nth(1),
      'ArrowLeft',
      `col:${before[0].id}`
    );
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect.poll(async () => (await readPhases(request, l1Id)).phases[0].id).toBe(before[1].id);
    const reordered = (await readPhases(request, l1Id)).phases;
    sent.length = 0;
    dialog = await openPhaseLayoutDialog(page, reordered[1].displayName);
    await dialog.getByRole('switch').first().click();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect.poll(() => sent.length).toBeGreaterThan(0);
    const after = (await readPhases(request, l1Id)).phases;
    expect(after.map(p => p.settings.sidebar)).toEqual(reordered.map(p => p.settings.sidebar));
    for (const m of sent) expect(JSON.stringify(m.variables).toLowerCase()).not.toContain('sidebar');
  });

  test('US1-AS7 — an empty sidebar hides the sidebar; only admins keep the drawer (edit-flow link)', async ({
    authedPage: page,
    request,
    readonlyUser,
  }) => {
    await settingsLayout(page, L1_URL);
    const dialog = await openCustomizeSidebar(page);
    for (const label of await selectedWidgets(dialog)) {
      await dialog.getByRole('checkbox', { name: `Toggle ${label}` }).click();
    }
    await expect(dialog.getByText(/No widgets selected/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    expect((await readPhases(request, l1Id)).phases[0].settings.sidebar).toEqual([]);

    await spaNavigate(page, L1_URL);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(sidebar(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Collapse', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Expand', exact: true })).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 800 });
    await page.getByRole('button', { name: 'Open menu' }).click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer.getByRole('complementary')).toHaveCount(0);
    await expect(drawer.getByRole('link', { name: 'Edit innovation flow' })).toBeVisible();

    if (missingReadonlyUser) return; // the member half needs the read-only persona
    const member = await readonlyUser();
    try {
      await member.page.setViewportSize({ width: 390, height: 800 });
      await member.page.goto(L1_URL);
      await expect(member.page.getByRole('main')).toBeVisible();
      await expect(member.page.getByRole('button', { name: 'Open menu' })).toHaveCount(0);
    } finally {
      await member.close();
    }
  });

  test('US1-AS8 — customizing with a pending reorder lands on the phase at position 1', async ({
    authedPage: page,
    request,
  }) => {
    const before = (await readPhases(request, l1Id)).phases;
    await settingsLayout(page, L1_URL);
    await keyboardDrag(
      page,
      page.getByRole('button', { name: 'Drag to reorder phase' }).nth(2),
      'ArrowLeft',
      `col:${before[0].id}`
    );
    expect((await columnOrder(page))[0]).toBe(before[2].displayName);

    const dialog = await openCustomizeSidebar(page);
    for (const label of await selectedWidgets(dialog)) {
      await dialog.getByRole('checkbox', { name: `Toggle ${label}` }).click();
    }
    await dialog.getByRole('checkbox', { name: 'Toggle Intention & Leads' }).click();
    await dialog.getByRole('checkbox', { name: 'Toggle About this Space' }).click();
    expect(await selectedWidgets(dialog)).toEqual(['Intention & Leads', 'About this Space']);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeEnabled(); // reorder still pending

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect
      .poll(async () => (await readPhases(request, l1Id)).phases[0].id)
      .toBe(before[2].id);
    expect((await readPhases(request, l1Id)).phases[0].settings.sidebar).toEqual(['INTENT', 'ABOUT']);

    await page.goto(L1_URL);
    await expect(sidebar(page)).toBeVisible();
    const items = (await sidebarItems(sidebar(page))).join('|');
    expect(items).toContain('BUTTON:About this Subspace');
    expect(items).not.toMatch(/Add Post|Search posts|Quick Actions/);
  });

  test('US1-AS9 — a member without update rights has no entry point and no settings route', async ({
    readonlyUser,
  }) => {
    test.skip(!!missingReadonlyUser, missingReadonlyUser);
    const { page, close } = await readonlyUser();
    try {
      await page.goto(L1_URL);
      await expect(sidebar(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /Customize Sidebar/ })).toHaveCount(0);
      await expect(page.getByRole('link', { name: 'Edit innovation flow' })).toHaveCount(0);
      await expect(page.getByRole('link', { name: 'Settings' })).toHaveCount(0);
      for (const path of ['/settings', '/settings/layout']) {
        await page.goto(`${L1_URL}${path}`);
        await expect(page.getByText('Access Restricted')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Customize Sidebar' })).toHaveCount(0);
      }
    } finally {
      await close();
    }
  });
});
