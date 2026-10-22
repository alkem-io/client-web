import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';

/**
 * @forge-acceptance
 * Platform-support organisation community administration — the orphaned-organisation repair walk:
 *   - a Support-only user opens /organization/<orphan>/settings and lands on the Community tab
 *   - (precondition of the accept) Support invites a registered user offering Admin
 *   - the invitee accepts from the organisation profile and holds Associate + Admin
 *   - on an organisation holding three Owners, a Support-offered Owner is withheld on accept
 *
 * Serial: the scenarios share state on two reset organisations (quickstart.md §3, "Orphan 090" and
 * "Owners 090"). Both are consumed by the walk, so re-running needs freshly seeded fixtures.
 * Everything is env-overridable; the defaults match the quickstart fixture:
 *   ALKEMIO_BASE_URL          shifted Traefik origin                      (default http://localhost:23000)
 *   E2E_ORPHAN_NAMEID         reset organisation with zero admins          (default orphan-090)
 *   E2E_OWNERS_NAMEID         reset organisation holding three Owners      (default owners-090)
 *   E2E_SUPPORT_EMAIL         user holding ONLY platform-support           (default support090@alkem.io)
 *   E2E_INVITEE_EMAIL         Admin-offer invitee                          (default invitee090@alkem.io)
 *   E2E_INVITEE_NAME          Admin-offer invitee display name             (default "invitee090 Walk")
 *   E2E_OWNER_EMAIL           one of the three Owners (used to cycle the third Owner)
 *                                                                          (default own1@alkem.io)
 *   E2E_OWNER_THIRD_EMAIL     the Owner that is dropped to 2 Owners and re-granted (default own3@alkem.io)
 *   E2E_OWNERS_INVITEE_EMAIL  Owner-offer invitee                          (default inviteeowner090@alkem.io)
 *   E2E_OWNERS_INVITEE_NAME   Owner-offer invitee display name             (default "inviteeowner090 Walk")
 *   E2E_USER_PASSWORD         shared password of every persona             (required)
 *   E2E_EVIDENCE_DIR          when set, a screenshot is written per decisive assertion
 *
 * Owner-limit note: the Invite dialog refuses an Owner offer while the organisation already holds three
 * Owners, so the invitation is created while only two Owners exist and the third Owner is
 * re-granted before the invitee accepts — the "role limit" is therefore hit at accept time.
 *
 * The `organization_administration` audit rows (invite_user + extra_role_honoured / role_granted for
 * the Admin offer; invite_user + extra_role_withheld reason role_limits for the Owner offer; initiatorRole platform_support;
 * no '@' in details) are asserted out-of-band with the psql query in quickstart.md §5.
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:23000';
const ORPHAN = process.env.E2E_ORPHAN_NAMEID || 'orphan-090';
const OWNERS = process.env.E2E_OWNERS_NAMEID || 'owners-090';
const SUPPORT = process.env.E2E_SUPPORT_EMAIL || 'support090@alkem.io';
const INVITEE = process.env.E2E_INVITEE_EMAIL || 'invitee090@alkem.io';
const INVITEE_NAME = process.env.E2E_INVITEE_NAME || 'invitee090 Walk';
const OWNER = process.env.E2E_OWNER_EMAIL || 'own1@alkem.io';
const OWNER_THIRD = process.env.E2E_OWNER_THIRD_EMAIL || 'own3@alkem.io';
const OWNERS_INVITEE = process.env.E2E_OWNERS_INVITEE_EMAIL || 'inviteeowner090@alkem.io';
const OWNERS_INVITEE_NAME = process.env.E2E_OWNERS_INVITEE_NAME || 'inviteeowner090 Walk';
const PASSWORD = process.env.E2E_USER_PASSWORD || '';
const EVIDENCE = process.env.E2E_EVIDENCE_DIR || '';

// ---------------------------------------------------------------- helpers

async function shot(page: Page, name: string): Promise<void> {
  if (!EVIDENCE) return;
  mkdirSync(EVIDENCE, { recursive: true });
  await page.screenshot({ path: join(EVIDENCE, `${name}.png`) });
}

async function login(page: Page, identifier: string): Promise<void> {
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: /E-Mail/i }).fill(identifier);
  await page.getByLabel(/^Password/).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(/.*home.*/);
}

// GraphQL through the logged-in browser context (alkemio_session + ory_kratos_session cookies).
async function gql<T = unknown>(page: Page, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await page.context().request.post(`${BASE}/graphql`, { data: { query, variables } });
  const body = await res.json();
  expect(body.errors, JSON.stringify(body.errors)).toBeUndefined();
  return body.data as T;
}

const ME = 'query { me { user { id } } }';
const ORGANIZATIONS = 'query { organizations { nameID roleSet { id } } }';
const ROLE_SET_OP = (op: 'assign' | 'remove') =>
  op === 'assign'
    ? 'mutation($a: UUID!, $r: RoleName!, $s: UUID!) { assignRoleToUser(roleData: { actorID: $a, role: $r, roleSetID: $s }) { id } }'
    : 'mutation($a: UUID!, $r: RoleName!, $s: UUID!) { removeRoleFromUser(roleData: { actorID: $a, role: $r, roleSetID: $s }) { id } }';

const communityUrl = (nameId: string) => `${BASE}/organization/${nameId}/settings/community`;

async function inviteRegisteredUser(page: Page, search: string, displayName: string, extraRole: 'Admin' | 'Owner') {
  await page.getByRole('button', { name: 'Invite', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /Invite associates/ });
  await dialog.getByPlaceholder('Username or email…').fill(search);
  await dialog.getByRole('button', { name: new RegExp(displayName) }).click();
  await dialog.getByRole('button', { name: 'Choose roles for the invitees' }).click();
  await page.getByRole('checkbox', { name: extraRole }).click();
  await page.keyboard.press('Escape');
  await expect(dialog.getByRole('button', { name: 'Choose roles for the invitees' })).toContainText(extraRole);
  await dialog.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(dialog.getByText('Invitation sent')).toBeVisible();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
}

async function respondToInvitation(page: Page, nameId: string): Promise<void> {
  await page.goto(`${BASE}/organization/${nameId}`);
  await page.getByRole('button', { name: /respond to invitation/i }).click();
  await shot(page, `US1-${nameId}-respond-dialog`);
  await page.getByRole('dialog').getByRole('button', { name: 'Accept', exact: true }).click();
  await expect(page.getByRole('button', { name: /respond to invitation/i })).toHaveCount(0);
}

// ---------------------------------------------------------------- the walk

test.describe.configure({ mode: 'serial' });

test.describe('@forge-acceptance 090 US1 — Support repairs an orphaned organisation by invitation', () => {
  test.skip(!PASSWORD, 'E2E_USER_PASSWORD is required');

  let support: Page;
  let invitee: Page;
  let owner: Page;
  let ownersInvitee: Page;
  let thirdOwner: Page;

  test.beforeAll(async ({ browser }) => {
    const personas = await Promise.all(
      [SUPPORT, INVITEE, OWNER, OWNERS_INVITEE, OWNER_THIRD].map(async email => {
        const page = await (await browser.newContext()).newPage();
        await login(page, email);
        return page;
      })
    );
    [support, invitee, owner, ownersInvitee, thirdOwner] = personas;
  });

  test.afterAll(async () => {
    await Promise.all([support, invitee, owner, ownersInvitee, thirdOwner].map(page => page?.context().close()));
  });

  test('US1-AS1: Support lands on the Community tab of the orphaned organisation with Invite enabled', async () => {
    await support.goto(`${BASE}/organization/${ORPHAN}/settings`);
    await expect(support).toHaveURL(new RegExp(`/organization/${ORPHAN}/settings/community$`));
    await expect(support.getByRole('heading', { name: /Pending applications & invitations/ })).toBeVisible();
    await expect(support.getByRole('heading', { name: 'Associates', level: 4 })).toBeVisible();
    await expect(support.getByRole('button', { name: 'Invite', exact: true })).toBeEnabled();
    await shot(support, 'US1-AS1-community-landing');
  });

  test('US1-AS2: Support invites a registered user as Associate offering Admin', async () => {
    await support.goto(communityUrl(ORPHAN));
    await inviteRegisteredUser(support, INVITEE.split('@')[0], INVITEE_NAME, 'Admin');
    const pending = support.getByRole('row').filter({ hasText: INVITEE_NAME });
    await expect(pending).toContainText('Invited');
    await expect(pending).toContainText('Associate + Admin');
    await shot(support, 'US1-AS2-pending-invitation');
  });

  test('US1-AS3: the invitee accepts and holds Associate + Admin on the organisation', async () => {
    await respondToInvitation(invitee, ORPHAN);
    // The new Admin can open the Community tab and sees themselves among the associates.
    await invitee.goto(communityUrl(ORPHAN));
    await expect(invitee.getByRole('heading', { name: 'Associates', level: 4 })).toBeVisible();
    await expect(invitee.getByText(INVITEE_NAME).first()).toBeVisible();
    await shot(invitee, 'US1-AS3-invitee-is-admin-community');
  });

  test('US1-AS5: with three Owners, a Support-offered Owner is withheld on accept (Associate only)', async () => {
    const { organizations } = await gql<{ organizations: { nameID: string; roleSet: { id: string } }[] }>(
      owner,
      ORGANIZATIONS
    );
    const roleSetID = organizations.find(org => org.nameID === OWNERS)!.roleSet.id;
    const thirdID = (await gql<{ me: { user: { id: string } } }>(thirdOwner, ME)).me.user.id;

    // The Invite dialog refuses an Owner offer at the three-Owner cap, so drop to two Owners ...
    await gql(owner, ROLE_SET_OP('remove'), { a: thirdID, r: 'OWNER', s: roleSetID });

    await support.goto(communityUrl(OWNERS));
    await inviteRegisteredUser(support, OWNERS_INVITEE.split('@')[0], OWNERS_INVITEE_NAME, 'Owner');
    const pending = support.getByRole('row').filter({ hasText: OWNERS_INVITEE_NAME });
    await expect(pending).toContainText('Associate + Owner');
    await shot(support, 'US1-AS5-support-invite-owner');

    // ... then restore three Owners before the invitee accepts, so the cap bites at accept time.
    await gql(owner, ROLE_SET_OP('assign'), { a: thirdID, r: 'OWNER', s: roleSetID });

    await respondToInvitation(ownersInvitee, OWNERS);
    await shot(ownersInvitee, 'US1-AS5-after-accept');

    // Associate only: the invitee is on the organisation profile's associates, with no Owner/Admin role.
    await support.goto(communityUrl(OWNERS));
    const row = support.getByRole('listitem').filter({ hasText: OWNERS_INVITEE_NAME });
    await expect(row).toBeVisible();
    await expect(row).not.toContainText(/Owner|Admin/);
  });
});
