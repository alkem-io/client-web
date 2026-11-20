import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';

/**
 * @forge-acceptance
 * Platform-support organisation community administration — the promote / approve+reject /
 * org-admin-control scenarios:
 *   - Support promotes an existing Associate to Admin
 *   - Support approves one pending application and rejects the other
 *   - an org admin (not Support) promotes the same way — unchanged
 *
 * Serial: the scenarios share state on one reset organisation (quickstart.md §3, "Managed 090").
 * Everything is env-overridable; the defaults match the quickstart fixture:
 *   ALKEMIO_BASE_URL          shifted Traefik origin            (default http://localhost:23000)
 *   E2E_ORG_NAMEID            reset organisation                (default managed-090)
 *   E2E_SUPPORT_EMAIL         user holding ONLY platform-support (default support090@alkem.io)
 *   E2E_CREATOR_EMAIL         org admin, not Support (control)   (default creator090@alkem.io)
 *   E2E_USER_PASSWORD         shared password of both personas   (required)
 *   E2E_ASSOCIATE_PROMOTE     Associate promoted by Support      (default "assoc090 Walk")
 *   E2E_ASSOCIATE_CONTROL     Associate promoted by the org admin (default "ctl090 Walk")
 *   E2E_APPLICANT_APPROVE     pending application to approve     (default "applicanta090 Walk")
 *   E2E_APPLICANT_REJECT      pending application to reject      (default "applicantb090 Walk")
 *   E2E_EVIDENCE_DIR          when set, a screenshot is written per decisive assertion
 *
 * The `organization_administration` audit rows (one per Support action with initiatorRole
 * platform_support, zero for the org-admin control, no '@' in details) are asserted out-of-band
 * with the psql query in quickstart.md §5.
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:23000';
const ORG = process.env.E2E_ORG_NAMEID || 'managed-090';
const SUPPORT = process.env.E2E_SUPPORT_EMAIL || 'support090@alkem.io';
const CREATOR = process.env.E2E_CREATOR_EMAIL || 'creator090@alkem.io';
const PASSWORD = process.env.E2E_USER_PASSWORD || '';
const PROMOTE = process.env.E2E_ASSOCIATE_PROMOTE || 'assoc090 Walk';
const CONTROL = process.env.E2E_ASSOCIATE_CONTROL || 'ctl090 Walk';
const APPROVE = process.env.E2E_APPLICANT_APPROVE || 'applicanta090 Walk';
const REJECT = process.env.E2E_APPLICANT_REJECT || 'applicantb090 Walk';
const EVIDENCE = process.env.E2E_EVIDENCE_DIR || '';
const COMMUNITY_URL = `${BASE}/organization/${ORG}/settings/community`;

async function login(page: Page, email: string): Promise<void> {
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: /E-Mail/i }).fill(email);
  await page.getByLabel(/^Password/).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(url => !url.pathname.startsWith('/login'));
}

const memberItem = (page: Page, name: string) =>
  page.getByRole('listitem').filter({ has: page.getByRole('button', { name: `Edit ${name}` }) });

async function openCommunity(page: Page): Promise<void> {
  await page.goto(COMMUNITY_URL);
  await expect(page.getByRole('heading', { name: 'Pending applications & invitations' })).toBeVisible();
}

async function evidence(page: Page, name: string): Promise<void> {
  if (!EVIDENCE) return;
  mkdirSync(EVIDENCE, { recursive: true });
  await page.screenshot({ path: join(EVIDENCE, `${name}.png`) });
}

async function promoteToAdmin(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: `Edit ${name}` }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('switch', { name: 'Admin' })).not.toBeChecked();
  await dialog.getByRole('switch', { name: 'Admin' }).click();
  await evidence(page, `US2-AS-${name.split(' ')[0]}-before-save`);
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toBeHidden();
  await expect(memberItem(page, name)).toContainText('Admin');
}

test.describe.configure({ mode: 'serial' });

test.describe('@forge-acceptance 090 US2 — promote, approve/reject and the org-admin control', () => {
  test.skip(!PASSWORD, 'E2E_USER_PASSWORD is required');

  let support: Page;
  let creator: Page;

  test.beforeAll(async ({ browser }) => {
    support = await (await browser.newContext()).newPage();
    await login(support, SUPPORT);
    creator = await (await browser.newContext()).newPage();
    await login(creator, CREATOR);
  });

  test.afterAll(async () => {
    await support.context().close();
    await creator.context().close();
  });

  test('US2-AS1 Support promotes an existing Associate to Admin', async () => {
    await openCommunity(support);
    // Support-only: the tab strip carries Community only.
    await expect(support.getByRole('tab')).toHaveCount(1);
    await promoteToAdmin(support, PROMOTE);
    await openCommunity(support);
    await expect(memberItem(support, PROMOTE)).toContainText('Associate');
    await expect(memberItem(support, PROMOTE)).toContainText('Admin');
    await evidence(support, 'US2-AS1-after');
  });

  test('US2-AS4 Support approves one application and rejects the other', async () => {
    await openCommunity(support);
    const row = (name: string) => support.getByRole('row').filter({ hasText: name });

    await row(APPROVE).getByRole('button', { name: 'Approve' }).click();
    await expect(support.getByRole('button', { name: `Edit ${APPROVE}` })).toBeVisible();
    await expect(memberItem(support, APPROVE)).toContainText('Associate');
    await evidence(support, 'US2-AS4-approved');

    await row(REJECT).getByRole('button', { name: 'Reject' }).click();
    await support
      .getByRole('alertdialog')
      .or(support.getByRole('dialog'))
      .getByRole('button', { name: /Reject application/i })
      .click();
    await expect(support.getByRole('button', { name: /Application rejected \(1\)/ })).toBeVisible();
    await expect(support.getByRole('button', { name: `Edit ${REJECT}` })).toHaveCount(0);
    await evidence(support, 'US2-AS4-rejected');
  });

  test('US2-AS7 an org admin (not Support) promotes the same way, unchanged', async () => {
    await openCommunity(creator);
    await promoteToAdmin(creator, CONTROL);
    await openCommunity(creator);
    await expect(memberItem(creator, CONTROL)).toContainText('Admin');
    await evidence(creator, 'US2-AS7-after');
  });
});
