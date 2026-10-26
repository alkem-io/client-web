import { expect, type Page, test } from '@playwright/test';

/**
 * @forge-acceptance
 * Platform-support organisation community administration — User Story 2
 * "Promote, demote, remove, approve and reject like an org admin" (US2-AS1 .. AS7).
 *
 * Runs serially against a live stack (the scenarios share state). Pre-seeded fixture
 * (quickstart.md §3, reset organisation) — all names are env-overridable:
 *   E2E_ORG_NAMEID            organisation nameID                       (default us2-managed-090)
 *   E2E_SUPPORT_EMAIL         user holding ONLY platform-support        (default us2support@alkem.io)
 *   E2E_CREATOR_EMAIL         org admin, not Support (AS7 control)      (default us2creator@alkem.io)
 *   E2E_USER_PASSWORD         shared password of the personas above
 *   E2E_ASSOCIATE_PROMOTE     display name of an Associate              (default "AssocOne Us2")  AS1/AS2/AS7
 *   E2E_ASSOCIATE_REMOVE      display name of an Associate              (default "AssocTwo Us2")  AS3
 *   E2E_APPLICANT_APPROVE     display name with a pending application   (default "AppOne Us2")    AS4
 *   E2E_APPLICANT_REJECT      display name with a pending application   (default "AppTwo Us2")    AS4
 *   E2E_INVITEE_PENDING       display name with a pending invitation    (default "InvitedUser Us2") AS5
 *   E2E_SOLE_OWNER            display name of the organisation's only Owner (default "AssocThree Us2") AS6
 *
 * The `organization_administration` audit rows (one per Support action, none for the org-admin
 * control, no '@' in details) are asserted out-of-band with the psql query in quickstart.md §5.
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:23000';
const ORG = process.env.E2E_ORG_NAMEID || 'us2-managed-090';
const SUPPORT = process.env.E2E_SUPPORT_EMAIL || 'us2support@alkem.io';
const CREATOR = process.env.E2E_CREATOR_EMAIL || 'us2creator@alkem.io';
const PASSWORD = process.env.E2E_USER_PASSWORD || '';
const PROMOTE = process.env.E2E_ASSOCIATE_PROMOTE || 'AssocOne Us2';
const REMOVE = process.env.E2E_ASSOCIATE_REMOVE || 'AssocTwo Us2';
const APPROVE = process.env.E2E_APPLICANT_APPROVE || 'AppOne Us2';
const REJECT = process.env.E2E_APPLICANT_REJECT || 'AppTwo Us2';
const PENDING = process.env.E2E_INVITEE_PENDING || 'InvitedUser Us2';
const SOLE_OWNER = process.env.E2E_SOLE_OWNER || 'AssocThree Us2';
const COMMUNITY_URL = `${BASE}/organization/${ORG}/settings/community`;

async function login(page: Page, email: string): Promise<void> {
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: /E-Mail/i }).fill(email);
  await page.getByLabel(/^Password/).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(/.*home.*/);
}

const memberItem = (page: Page, name: string) =>
  page.getByRole('listitem').filter({ has: page.getByRole('button', { name: `Edit ${name}` }) });

async function openCommunity(page: Page): Promise<void> {
  await page.goto(COMMUNITY_URL);
  await expect(page.getByRole('heading', { name: 'Pending applications & invitations' })).toBeVisible();
}

test.describe.configure({ mode: 'serial' });

test.describe('@forge-acceptance 090 US2 — Support manages existing people on the Community tab', () => {
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

  test('US2-AS1 Support promotes an Associate to Admin', async () => {
    await openCommunity(support);
    await support.getByRole('button', { name: `Edit ${PROMOTE}` }).click();
    const dialog = support.getByRole('dialog');
    await expect(dialog.getByRole('switch', { name: 'Admin' })).not.toBeChecked();
    await dialog.getByRole('switch', { name: 'Admin' }).click();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect(memberItem(support, PROMOTE)).toContainText('Admin');
  });

  test('US2-AS2 Support demotes an Admin back to Associate', async () => {
    await openCommunity(support);
    await expect(memberItem(support, PROMOTE)).toContainText('Admin');
    await support.getByRole('button', { name: `Edit ${PROMOTE}` }).click();
    const dialog = support.getByRole('dialog');
    await expect(dialog.getByRole('switch', { name: 'Admin' })).toBeChecked();
    await dialog.getByRole('switch', { name: 'Admin' }).click();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect(memberItem(support, PROMOTE)).toContainText('Associate');
    await expect(memberItem(support, PROMOTE)).not.toContainText('Admin');
  });

  test('US2-AS3 Support removes an Associate from the organisation', async () => {
    await openCommunity(support);
    await support.getByRole('button', { name: `Edit ${REMOVE}` }).click();
    await support.getByRole('dialog').getByRole('button', { name: 'Remove from organisation' }).click();
    await support.getByRole('alertdialog').getByRole('button', { name: 'Remove from organisation' }).click();
    await expect(support.getByText(`${REMOVE} removed from the organisation`)).toBeVisible();
    await expect(support.getByRole('button', { name: `Edit ${REMOVE}` })).toHaveCount(0);
  });

  test('US2-AS4 Support approves one application and rejects the other', async () => {
    await openCommunity(support);
    const row = (name: string) => support.getByRole('row').filter({ hasText: name });
    await row(APPROVE).getByRole('button', { name: 'Approve' }).click();
    await expect(support.getByRole('button', { name: `Edit ${APPROVE}` })).toBeVisible();

    await row(REJECT).getByRole('button', { name: 'Reject' }).click();
    await support
      .getByRole('alertdialog')
      .or(support.getByRole('dialog'))
      .getByRole('button', { name: /Reject application/i })
      .click();
    await expect(support.getByRole('button', { name: /Application rejected \(1\)/ })).toBeVisible();
    await expect(support.getByRole('button', { name: `Edit ${REJECT}` })).toHaveCount(0);
  });

  test('US2-AS5 Support revokes a pending user invitation', async () => {
    await openCommunity(support);
    await expect(support.getByRole('button', { name: /^Invited \(1\)$/ })).toBeVisible();
    await support.getByRole('row').filter({ hasText: PENDING }).getByRole('button', { name: 'Delete' }).click();
    await support
      .getByRole('alertdialog')
      .or(support.getByRole('dialog'))
      .getByRole('button', { name: /Revoke invitation/i })
      .click();
    await expect(support.getByRole('button', { name: /^Invited \(0\)$/ })).toBeVisible();
    await expect(support.getByRole('row').filter({ hasText: PENDING })).toHaveCount(0);
  });

  test('US2-AS6 removing the only Owner fails with the role-limit error', async () => {
    await openCommunity(support);
    await support.getByRole('button', { name: `Edit ${SOLE_OWNER}` }).click();
    await support.getByRole('dialog').getByRole('button', { name: 'Remove from organisation' }).click();
    await support.getByRole('alertdialog').getByRole('button', { name: 'Remove from organisation' }).click();
    await expect(support.getByText('An organisation must keep at least one owner')).toBeVisible();
    await expect(memberItem(support, SOLE_OWNER)).toContainText('Owner');
  });

  test('US2-AS7 an org admin (not Support) promotes the same way, unchanged', async () => {
    await openCommunity(creator);
    await creator.getByRole('button', { name: `Edit ${PROMOTE}` }).click();
    const dialog = creator.getByRole('dialog');
    await expect(dialog.getByRole('switch', { name: 'Admin' })).not.toBeChecked();
    await dialog.getByRole('switch', { name: 'Admin' }).click();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect(memberItem(creator, PROMOTE)).toContainText('Admin');
  });
});
