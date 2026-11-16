import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { expect, test } from '../fixtures/authFixture';

/**
 * @forge-acceptance
 * workspace#101-profile-hover-cards — US2: preview an organisation leading a space (client-web#9960).
 *
 * Desktop viewport, mouse hover, headless. Walks US2-AS1..AS3 on the space page sidebar's "Space Leads" block.
 *
 * Fixture (seeded once per stack; see specs/101-profile-hover-cards/repos.yaml → verification.notes):
 *  - a space `HOVER_SPACE` (default `hover-space`) whose leads include
 *  - organisation Acme (`HOVER_ACME_NAMEID`, default `acme-hover`): city Delft, country NL, tagline "Open data",
 *    keywords `mobility`. Organisations enter a space only by invitation (server#6623), so the fixture invites
 *    Acme with extraRoles [LEAD] and accepts as the organisation's admin;
 *  - user Bob (`HOVER_BOB_NAME`, default `Bob Hover`): city Utrecht, country NL, tagline "Builds bridges",
 *    keywords `climate`, `governance`, chat messaging allowed.
 *
 * Env: ALKEMIO_BASE_URL (default http://localhost:3000), AUTH_TEST_HARNESS_EMAIL / AUTH_TEST_HARNESS_PASSWORD
 * (the viewer — signed in, English UI, not Bob), HOVER_ORG_ADMIN_EMAIL / HOVER_ORG_ADMIN_PASSWORD (an account
 * that may edit Acme's profile; US2-AS2 clears Acme's keywords through the non-interactive login and restores
 * them), HOVER_EVIDENCE_DIR (optional screenshot directory), E2E_CHROMIUM_EXECUTABLE (optional browser binary).
 * Never runs headed.
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';
const SPACE_NAMEID = process.env.HOVER_SPACE || 'hover-space';
const ACME = process.env.HOVER_ACME_NAME || 'Acme';
const ACME_NAMEID = process.env.HOVER_ACME_NAMEID || 'acme-hover';
const BOB = process.env.HOVER_BOB_NAME || 'Bob Hover';
const BOB_NAMEID = process.env.HOVER_BOB_NAMEID || 'bob-hover';
const ORG_ADMIN_EMAIL = process.env.HOVER_ORG_ADMIN_EMAIL || 'admin@alkem.io';
const ORG_ADMIN_PASSWORD = process.env.HOVER_ORG_ADMIN_PASSWORD || process.env.AUTH_TEST_HARNESS_PASSWORD;
const EVIDENCE = process.env.HOVER_EVIDENCE_DIR;
const SPACE_URL = `${BASE}/${SPACE_NAMEID}`;

test.use({
  viewport: { width: 1440, height: 900 },
  ...(process.env.E2E_CHROMIUM_EXECUTABLE
    ? { launchOptions: { executablePath: process.env.E2E_CHROMIUM_EXECUTABLE } }
    : {}),
});
test.describe.configure({ mode: 'serial' });

const card = (page: Page): Locator => page.locator('[data-slot=hover-card-content]');

const evidence = async (page: Page, name: string) => {
  if (EVIDENCE) await page.screenshot({ path: `${EVIDENCE}/${name}.png` });
};

/** The visible lead row linking to `profilePath` (the sidebar also renders a hidden mobile copy). */
const leadRow = async (page: Page, profilePath: string): Promise<Locator> => {
  await page.goto(SPACE_URL);
  const block = page.getByText('Space Leads', { exact: true }).locator('visible=true').locator('xpath=..');
  const row = block.locator(`a[href$="${profilePath}"]`).locator('visible=true');
  await expect(row).toBeVisible();
  return row;
};

const hoverOpen = async (page: Page, trigger: Locator) => {
  await page.mouse.move(5, 5);
  await trigger.hover();
  await expect(card(page)).toBeVisible();
};

const orgAdminGql = async (request: APIRequestContext, query: string, variables: Record<string, unknown> = {}) => {
  if (!ORG_ADMIN_PASSWORD) throw new Error('HOVER_ORG_ADMIN_PASSWORD (or AUTH_TEST_HARNESS_PASSWORD) is required');
  const login = await request.post(`${BASE}/api/auth/non-interactive-login`, {
    data: { email: ORG_ADMIN_EMAIL, password: ORG_ADMIN_PASSWORD },
  });
  expect(login.ok(), await login.text()).toBe(true);
  const { api_token } = await login.json();
  const res = await request.post(`${BASE}/api/private/non-interactive/graphql`, {
    data: { query, variables },
    headers: { Authorization: `Bearer ${api_token}` },
  });
  const body = await res.json();
  expect(body.errors, JSON.stringify(body.errors)).toBeUndefined();
  return body.data;
};

const setAcmeKeywords = async (request: APIRequestContext, tags: string[]) => {
  const lookup = await orgAdminGql(request, `{ lookupByName { organization(NAMEID: "${ACME_NAMEID}") } }`);
  const org = await orgAdminGql(request, 'query($id: UUID!) { organization(ID: $id) { profile { tagsets { id name } } } }', {
    id: lookup.lookupByName.organization,
  });
  const keywords = (org.organization.profile.tagsets as { id: string; name: string }[]).find(t => t.name === 'keywords');
  if (!keywords) throw new Error('Acme has no keywords tagset');
  await orgAdminGql(request, 'mutation($d: UpdateTagsetInput!) { updateTagset(updateData: $d) { id } }', {
    d: { ID: keywords.id, tags },
  });
};

test.describe('101 US2 — preview an organisation leading a space', () => {
  test('US2-AS1 hovering the lead organisation shows a square avatar, name, location, tagline, keyword tag and no Message', async ({
    authedPage: page,
  }) => {
    await hoverOpen(page, await leadRow(page, `/organization/${ACME_NAMEID}`));
    const c = card(page);
    await expect(c.locator('[data-slot=avatar]')).toHaveClass(/rounded-md/);
    await expect(c.getByRole('link', { name: ACME, exact: true })).toHaveAttribute(
      'href',
      new RegExp(`/organization/${ACME_NAMEID}$`)
    );
    await expect(c.getByText('Delft, NL', { exact: true })).toBeVisible();
    await expect(c.getByText('Open data', { exact: true })).toBeVisible();
    await expect(c.getByRole('listitem')).toHaveText(['mobility']);
    await expect(c.getByRole('button', { name: 'Message' })).toHaveCount(0);
    await evidence(page, 'US2-AS1');
  });

  test('US2-AS2 an organisation without keywords shows no tag row and a shorter card', async ({ authedPage: page }) => {
    await hoverOpen(page, await leadRow(page, `/organization/${ACME_NAMEID}`));
    await expect(card(page).getByRole('list')).toHaveCount(1);
    const withTags = (await card(page).boundingBox())?.height ?? 0;

    const request = page.context().request;
    await setAcmeKeywords(request, []);
    try {
      await hoverOpen(page, await leadRow(page, `/organization/${ACME_NAMEID}`));
      const c = card(page);
      await expect(c.getByText('Open data', { exact: true })).toBeVisible();
      await expect(c.getByRole('list')).toHaveCount(0);
      await expect(c.getByRole('listitem')).toHaveCount(0);
      expect((await c.boundingBox())?.height ?? 0).toBeLessThan(withTags);
      await evidence(page, 'US2-AS2');
    } finally {
      await setAcmeKeywords(request, ['mobility']);
    }
  });

  test('US2-AS3 hovering a lead user shows the member card; Message opens the direct chat with that lead', async ({
    authedPage: page,
  }) => {
    await hoverOpen(page, await leadRow(page, `/user/${BOB_NAMEID}`));
    const c = card(page);
    await expect(c.locator('[data-slot=avatar]')).toHaveClass(/rounded-full/);
    await expect(c.getByRole('link', { name: BOB, exact: true })).toBeVisible();
    await expect(c.getByText('Utrecht, NL', { exact: true })).toBeVisible();
    await expect(c.getByText('Builds bridges', { exact: true })).toBeVisible();
    await expect(c.getByRole('listitem')).toHaveText(['climate', 'governance']);

    const created = page.waitForResponse(
      r => r.url().includes('graphql') && r.request().postDataJSON()?.operationName === 'CreateConversation'
    );
    await c.getByRole('button', { name: 'Message', exact: true }).click();
    expect((await (await created).json()).errors).toBeUndefined();
    const chat = page.getByRole('dialog', { name: BOB, exact: true });
    await expect(chat).toBeVisible();
    await expect(chat.getByRole('textbox')).toBeVisible();
    await evidence(page, 'US2-AS3');

    const request = page.context().request;
    const lookup = await request.post(`${BASE}/api/private/graphql`, {
      data: { query: `{ lookupByName { user(NAMEID: "${BOB_NAMEID}") } }` },
    });
    const bobId: string = (await lookup.json()).data.lookupByName.user;
    const res = await request.post(`${BASE}/api/private/graphql`, {
      data: { query: '{ me { conversations { conversations { members { id } room { type } } } } }' },
    });
    const conversations = (
      (await res.json()).data.me.conversations.conversations as { members: { id: string }[]; room: { type: string } }[]
    ).filter(x => x.room.type === 'CONVERSATION_DIRECT' && x.members.some(m => m.id === bobId));
    expect(conversations).toHaveLength(1);
  });
});
