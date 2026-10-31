import type { Locator, Page } from '@playwright/test';
import { expect, test } from '../fixtures/authFixture';

/**
 * @forge-acceptance
 * 093-app-back-closes-overlays — User Story 1 "Back closes the topmost open overlay"
 * (US1-AS1 .. AS8).
 *
 * Drives the page's web-owned entry point exactly as the Android shell does:
 * `window.alkemioApp.handleBack()`. Phone viewport. Seeds its own space, post callout,
 * subspace and calendar event through the API (unique nameIDs per run, all prefixed `093-`),
 * so it is re-runnable and never touches existing content. Runs serially (shared fixture).
 *
 * Required env: ALKEMIO_BASE_URL (default http://localhost:3000), AUTH_TEST_HARNESS_EMAIL
 * (platform admin, default admin@alkem.io), AUTH_TEST_HARNESS_PASSWORD.
 *
 * Notes recorded from the walk:
 *  - A card tap on the space page opens a STATE-bound callout dialog (no route). The URL-bound
 *    dialog (AS2) is reached through an in-app link to the callout route (Activity list) or a
 *    deep link; closing it is one replace-navigation to the parent, `?tab` preserved.
 *  - The calendar / add-event sheets are URL-bound, so closing them navigates to the parent;
 *    the non-URL-bound sheet is the subspace mobile menu (AS6).
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';
const RUN = Date.now().toString(36);
const SPACE_NAMEID = `093-us1-space-${RUN}`;
const CALLOUT_NAMEID = `093-us1-post-${RUN}`;
const SUBSPACE_NAMEID = `093-us1-sub-${RUN}`;
const EVENT_NAMEID = `093-us1-event-${RUN}`;
const CALLOUT_TITLE = `093-US1 Post ${RUN}`;
const EVENT_TITLE = `093-US1 Event ${RUN}`;
const SPACE_URL = `${BASE}/${SPACE_NAMEID}`;
const PHONE = { width: 390, height: 844 };

test.describe.configure({ mode: 'serial' });

const gql = async <T = any>(page: Page, query: string, variables: Record<string, unknown> = {}): Promise<T> => {
  const res = await page.context().request.post(`${BASE}/api/private/graphql`, { data: { query, variables } });
  const body = await res.json();
  expect(body.errors, JSON.stringify(body.errors)).toBeUndefined();
  return body.data as T;
};

/** The page-side Back entry point; its declaration lives in src/, outside the e2e tsconfig. */
type AppBackWindow = Window & { alkemioApp?: { version: 1; handleBack(): boolean } };

/** Drive Back exactly as the shell does. */
const back = (page: Page): Promise<boolean> => page.evaluate(() => (window as AppBackWindow).alkemioApp!.handleBack());

/** Count every navigation (push / replace / traverse) from now on, via the Navigation API. */
const trackNavigations = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __navs: string[] };
    w.__navs = [];
    (window as any).navigation.addEventListener('navigate', (e: any) => {
      w.__navs.push(`${e.navigationType}:${e.destination.url}`);
    });
  });
const navigations = (page: Page): Promise<string[]> =>
  page.evaluate(() => (window as unknown as { __navs: string[] }).__navs);

/** Open dismissable layers (the drawer is always mounted, so aria-hidden ones are excluded). */
const layers = (page: Page): Locator =>
  page.locator('[role=dialog]:not([aria-hidden=true]),[role=alertdialog],[role=menu],[role=listbox]');
const drawer = (page: Page): Locator => page.locator('aside[aria-label=Menu]');

let spaceID = '';
let calloutsSetID = '';

test.describe('093 US1 — Back closes the topmost overlay', () => {
  test.beforeEach(async ({ authedPage }) => {
    await authedPage.setViewportSize(PHONE);
  });

  test('seed fixtures', async ({ authedPage: page }) => {
    const me = await gql(page, 'query { me { user { account { id } } } }');
    const accountID = me.me.user.account.id;
    const space = await gql(
      page,
      'mutation($d: CreateSpaceOnAccountInput!) { createSpace(spaceData: $d) { id collaboration { calloutsSet { id } } } }',
      {
        d: {
          accountID,
          nameID: SPACE_NAMEID,
          about: { profileData: { displayName: `093-US1 Space ${RUN}`, tagline: '093 US1 fixture' } },
          collaborationData: { addCallouts: false, addTutorialCallouts: false, calloutsSetData: {} },
        },
      }
    );
    spaceID = space.createSpace.id;
    calloutsSetID = space.createSpace.collaboration.calloutsSet.id;
    await gql(
      page,
      'mutation($d: CreateCalloutOnCalloutsSetInput!) { createCalloutOnCalloutsSet(calloutData: $d) { id } }',
      {
        d: {
          calloutsSetID,
          nameID: CALLOUT_NAMEID,
          framing: {
            type: 'NONE',
            profile: { displayName: CALLOUT_TITLE, description: 'A post callout for the Back walk. '.repeat(30) },
          },
          settings: {
            visibility: 'PUBLISHED',
            contribution: {
              enabled: true,
              allowedTypes: ['POST'],
              canAddContributions: 'MEMBERS',
              commentsEnabled: true,
            },
            framing: { commentsEnabled: true },
          },
        },
      }
    );
    await gql(page, 'mutation($d: CreateSubspaceInput!) { createSubspace(subspaceData: $d) { id } }', {
      d: {
        spaceID,
        nameID: SUBSPACE_NAMEID,
        about: { profileData: { displayName: `093-US1 Subspace ${RUN}`, tagline: '093 sub' } },
        collaborationData: { addCallouts: false, addTutorialCallouts: false, calloutsSetData: {} },
      },
    });
    const cal = await gql(
      page,
      'query($id: UUID!) { lookup { space(ID: $id) { collaboration { timeline { calendar { id } } } } } }',
      { id: spaceID }
    );
    await gql(
      page,
      'mutation($d: CreateCalendarEventOnCalendarInput!) { createEventOnCalendar(eventData: $d) { id } }',
      {
        d: {
          calendarID: cal.lookup.space.collaboration.timeline.calendar.id,
          nameID: EVENT_NAMEID,
          profileData: { displayName: EVENT_TITLE },
          startDate: new Date().toISOString(),
          durationMinutes: 60,
          multipleDays: false,
          wholeDay: false,
          visibleOnParentCalendar: false,
          type: 'EVENT',
        },
      }
    );
  });

  test('US1-AS1 chat panel (conversation list) closes; URL and scroll unchanged', async ({ authedPage: page }) => {
    await page.goto(SPACE_URL);
    await expect(page.getByRole('heading', { name: /093-US1 Space/ }).first()).toBeVisible();
    await expect(page.getByText(CALLOUT_TITLE).first()).toBeVisible(); // content rendered, so the page is tall enough to scroll
    await expect
      .poll(async () => {
        await page.evaluate(() => window.scrollTo(0, 400));
        return page.evaluate(() => window.scrollY);
      })
      .toBeGreaterThan(0);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.getByRole('button', { name: 'Messages', exact: true }).click();
    const chat = page.getByRole('dialog', { name: 'Chat' });
    await expect(chat).toBeVisible();
    await expect(chat.getByPlaceholder(/Search conversations/i)).toBeVisible(); // the list, not a thread
    expect(await back(page)).toBe(true);
    await expect(chat).toHaveCount(0);
    expect(page.url()).toBe(SPACE_URL);
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
  });

  test('US1-AS2 URL-bound callout dialog: one replace-navigation to the parent, no re-open', async ({
    authedPage: page,
  }) => {
    // A: reached in-app (SPA navigation) through the Activity list
    await page.goto(SPACE_URL);
    await page.getByRole('button', { name: 'Activity', exact: true }).first().click();
    await layers(page).locator('a').filter({ hasText: CALLOUT_TITLE }).first().click();
    await expect(page).toHaveURL(`${SPACE_URL}/collaboration/${CALLOUT_NAMEID}`);
    await expect(layers(page)).toHaveCount(1);
    await trackNavigations(page);
    expect(await back(page)).toBe(true);
    await expect(layers(page)).toHaveCount(0);
    await expect(page).toHaveURL(SPACE_URL);
    // observation window: no re-open, no second navigation
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    await expect(layers(page)).toHaveCount(0);
    expect(await navigations(page)).toEqual([`replace:${SPACE_URL}`]);
    expect(await back(page)).toBe(false); // nothing open any more

    // B: the `?tab` query is preserved
    await page.goto(`${SPACE_URL}/collaboration/${CALLOUT_NAMEID}?tab=1`);
    await expect(layers(page)).toHaveCount(1);
    await trackNavigations(page);
    expect(await back(page)).toBe(true);
    await expect(page).toHaveURL(`${SPACE_URL}?tab=1`);
    await expect(layers(page)).toHaveCount(0);
    expect(await navigations(page)).toEqual([`replace:${SPACE_URL}?tab=1`]);
    expect(await back(page)).toBe(false);
  });

  test('US1-AS3 notifications panel closes; URL unchanged', async ({ authedPage: page }) => {
    await page.goto(SPACE_URL);
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    await expect(layers(page).filter({ hasText: 'Notifications' })).toBeVisible();
    expect(await back(page)).toBe(true);
    await expect(layers(page)).toHaveCount(0);
    expect(page.url()).toBe(SPACE_URL);
  });

  test('US1-AS4 search overlay closes; URL unchanged', async ({ authedPage: page }) => {
    await page.goto(SPACE_URL);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Platform Search' })).toBeVisible();
    expect(await back(page)).toBe(true);
    await expect(page.getByRole('dialog', { name: 'Platform Search' })).toHaveCount(0);
    expect(page.url()).toBe(SPACE_URL);
  });

  test('US1-AS5 mobile sidebar drawer closes; URL unchanged', async ({ authedPage: page }) => {
    await page.goto(SPACE_URL);
    await expect(drawer(page)).toHaveAttribute('aria-hidden', 'true');
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(drawer(page)).toHaveAttribute('aria-hidden', 'false');
    expect(await back(page)).toBe(true);
    await expect(drawer(page)).toHaveAttribute('aria-hidden', 'true');
    expect(page.url()).toBe(SPACE_URL);
  });

  test('US1-AS6 dropdown menu, alert dialog, sheet and select list each close; URL unchanged', async ({
    authedPage: page,
  }) => {
    // dropdown menu + alert dialog (callout menu -> Delete; never confirmed)
    await page.goto(SPACE_URL);
    const calloutMenu = page.getByRole('button', { name: 'Settings', exact: true }).first();
    await calloutMenu.click();
    await expect(page.getByRole('menu')).toBeVisible();
    expect(await back(page)).toBe(true);
    await expect(layers(page)).toHaveCount(0);
    expect(page.url()).toBe(SPACE_URL);

    await calloutMenu.click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    expect(await back(page)).toBe(true);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    expect(page.url()).toBe(SPACE_URL);
    await expect(page.getByRole('link', { name: `Open ${CALLOUT_TITLE}` })).toHaveCount(1); // not deleted

    // sheet (non-URL-bound: the subspace mobile menu)
    const subUrl = `${SPACE_URL}/challenges/${SUBSPACE_NAMEID}`;
    await page.goto(subUrl);
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await expect(page.locator('[data-slot=sheet-content]')).toBeVisible();
    expect(await back(page)).toBe(true);
    await expect(page.locator('[data-slot=sheet-content]')).toHaveCount(0);
    expect(page.url()).toBe(subUrl);

    // select list inside a sheet: only the list closes
    await page.goto(`${SPACE_URL}/calendar?new=1`);
    await expect(page.locator('[data-slot=sheet-content]')).toBeVisible();
    await page.getByRole('combobox', { name: /Type/ }).first().click();
    await expect(page.getByRole('listbox')).toBeVisible();
    expect(await back(page)).toBe(true);
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(page.locator('[data-slot=sheet-content]')).toBeVisible();
  });

  test('US1-AS7 stacked layers: one Back closes only the topmost', async ({ authedPage: page }) => {
    // dropdown menu inside the search overlay
    await page.goto(SPACE_URL);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const search = page.getByRole('dialog', { name: 'Platform Search' });
    await expect(search).toBeVisible();
    await page.getByRole('button', { name: /Change search scope/ }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    expect(await back(page)).toBe(true);
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(search).toBeVisible();
    expect(page.url()).toBe(SPACE_URL);
    expect(await back(page)).toBe(true);
    await expect(search).toHaveCount(0);
    expect(page.url()).toBe(SPACE_URL);

    // confirmation dialog over a sheet (calendar event edit sheet -> Delete event; never confirmed)
    const eventUrl = `${SPACE_URL}/calendar/${EVENT_NAMEID}`;
    await page.goto(eventUrl);
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByRole('button', { name: 'Delete event' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await trackNavigations(page);
    expect(await back(page)).toBe(true);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.locator('[data-slot=sheet-content]')).toBeVisible(); // the sheet beneath stays open
    expect(page.url()).toBe(eventUrl);
    expect(await navigations(page)).toEqual([]);
    expect(await back(page)).toBe(true); // second press closes the sheet (URL-bound: replace to the parent)
    await expect(page.locator('[data-slot=sheet-content]')).toHaveCount(0);
  });

  test('US1-AS8 first history entry with the chat open: Back is consumed (the shell would not exit)', async ({
    authedPage: seed,
  }) => {
    // A popup is the only way to get a page whose history.length === 1 under Playwright.
    const [page] = await Promise.all([
      seed.context().waitForEvent('page'),
      seed.evaluate(url => {
        window.open(url, '_blank');
      }, `${BASE}/home`),
    ]);
    await page.setViewportSize(PHONE);
    await page.waitForLoadState();
    expect(await page.evaluate(() => history.length)).toBe(1);
    await page.getByRole('button', { name: 'Messages', exact: true }).click();
    const chat = page.getByRole('dialog', { name: 'Chat' });
    await expect(chat).toBeVisible();
    expect(await back(page)).toBe(true);
    await expect(chat).toHaveCount(0);
    expect(page.url()).toBe(`${BASE}/home`);
  });
});
