import { expect, type Page, test } from '@playwright/test';

/**
 * @forge-acceptance
 * Platform-support organisation community administration — User Story 1
 * "Repair an orphaned organisation by invitation" (US1-AS1 .. AS6).
 *
 * Runs serially against a live stack (the scenarios share state). The spec seeds its own
 * organisations through the API (unique nameIDs per run), so it is re-runnable. Required,
 * pre-registered + email-verified personas (all share E2E_USER_PASSWORD), env-overridable:
 *   E2E_SUPPORT_EMAIL     user that will be granted ONLY platform-support   (us1support@alkem.io)
 *   E2E_CREATOR_EMAIL     creates the fixture organisations                 (us1creator@alkem.io)
 *   E2E_INVITEE_EMAIL     AS2/AS3 invitee, display name "U1invitee Us1"     (us1invitee@alkem.io)
 *   E2E_INVITEEB_EMAIL    AS4 invitee, display name "U1inviteeb Us1"        (us1inviteeb@alkem.io)
 *   E2E_OWNER_A/B/C_EMAIL three associates promoted to Owner (AS5)          (us1ownera/b/c@alkem.io)
 *   E2E_OWNER_D_EMAIL     AS5 invitee, display name "U1ownerd Us1"          (us1ownerd@alkem.io)
 *   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD   platform admin (grants/revokes platform-support, resets policies)
 *
 * The `organization_administration` audit rows (one per Support action; extra_role_honoured /
 * extra_role_withheld with reason; no '@' in details) are asserted out-of-band with the psql
 * query in quickstart.md §5.
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:23000';
const PASSWORD = process.env.E2E_USER_PASSWORD || '';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@alkem.io';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';
const email = (key: string, fallback: string) => process.env[key] || fallback;
const SUPPORT = email('E2E_SUPPORT_EMAIL', 'us1support@alkem.io');
const CREATOR = email('E2E_CREATOR_EMAIL', 'us1creator@alkem.io');
const INVITEE = email('E2E_INVITEE_EMAIL', 'us1invitee@alkem.io');
const INVITEEB = email('E2E_INVITEEB_EMAIL', 'us1inviteeb@alkem.io');
const OWNER_A = email('E2E_OWNER_A_EMAIL', 'us1ownera@alkem.io');
const OWNER_B = email('E2E_OWNER_B_EMAIL', 'us1ownerb@alkem.io');
const OWNER_C = email('E2E_OWNER_C_EMAIL', 'us1ownerc@alkem.io');
const OWNER_D = email('E2E_OWNER_D_EMAIL', 'us1ownerd@alkem.io');
const INVITEE_NAME = 'U1invitee Us1';
const INVITEEB_NAME = 'U1inviteeb Us1';
const OWNER_D_NAME = 'U1ownerd Us1';
const UNREGISTERED = `unregistered-us1-${Date.now()}@example.org`;

const RUN = Date.now().toString(36);
const ORPHAN_NAMEID = `us1-orphan-${RUN}`;
const OWNERS_NAMEID = `us1-owners-${RUN}`;

// ---------------------------------------------------------------- API helpers
// GraphQL is called through a logged-in browser context (alkemio_session + ory_kratos_session cookies).

async function gql<T = any>(page: Page, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await page.context().request.post(`${BASE}/graphql`, { data: { query, variables } });
  const body = await res.json();
  expect(body.errors, JSON.stringify(body.errors)).toBeUndefined();
  return body.data as T;
}

const ME = 'query { me { user { id } } }';
const PLATFORM_ROLE = (op: 'assign' | 'remove') =>
  op === 'assign'
    ? 'mutation($a: UUID!, $r: RoleName!) { assignPlatformRoleToUser(roleData: { actorID: $a, role: $r }) { id } }'
    : 'mutation($a: UUID!, $r: RoleName!) { removePlatformRoleFromUser(roleData: { actorID: $a, role: $r }) { id } }';
const ROLE_SET = (op: 'assign' | 'remove') =>
  op === 'assign'
    ? 'mutation($a: UUID!, $r: RoleName!, $s: UUID!) { assignRoleToUser(roleData: { actorID: $a, role: $r, roleSetID: $s }) { id } }'
    : 'mutation($a: UUID!, $r: RoleName!, $s: UUID!) { removeRoleFromUser(roleData: { actorID: $a, role: $r, roleSetID: $s }) { id } }';
const CREATE_ORG =
  'mutation($n: NameID!, $d: String!) { createOrganization(organizationData: { nameID: $n, profileData: { displayName: $d } }) { id roleSet { id } } }';
const RESET_ORG =
  'mutation($o: UUID!) { authorizationPolicyResetOnOrganization(authorizationResetData: { organizationID: $o }) { id } }';

// ---------------------------------------------------------------- UI helpers

async function login(page: Page, identifier: string, password = PASSWORD): Promise<void> {
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: /E-Mail/i }).fill(identifier);
  await page.getByLabel(/^Password/).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(/.*home.*/);
}

const communityUrl = (nameId: string) => `${BASE}/organization/${nameId}/settings/community`;

async function openInviteDialog(page: Page) {
  await page.getByRole('button', { name: /^Invite$/i }).click();
  return page.getByRole('dialog', { name: /Invite associates/ });
}

async function inviteRegisteredUser(page: Page, search: string, displayName: string, extraRole: 'Admin' | 'Owner') {
  const dialog = await openInviteDialog(page);
  await dialog.getByPlaceholder('Username or email…').fill(search);
  await page.getByText(displayName, { exact: true }).click();
  await dialog.getByRole('button', { name: 'Choose roles for the invitees' }).click();
  await page
    .getByRole('menuitemcheckbox', { name: new RegExp(extraRole, 'i') })
    .or(page.getByRole('checkbox', { name: new RegExp(extraRole, 'i') }))
    .first()
    .click();
  await page.keyboard.press('Escape');
  await expect(dialog.getByRole('button', { name: 'Choose roles for the invitees' })).toContainText(extraRole);
  await dialog.getByRole('button', { name: /^Send$/i }).click();
}

async function acceptFromProfile(page: Page, nameId: string): Promise<void> {
  await page.goto(`${BASE}/organization/${nameId}`);
  await page.getByRole('button', { name: /respond to invitation/i }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Invited by U1support Us1')).toBeVisible();
  await dialog.getByRole('button', { name: /^accept$/i }).click();
  await expect(page.getByRole('button', { name: /respond to invitation/i })).toHaveCount(0);
}

const memberItem = (page: Page, name: string) =>
  page.getByRole('listitem').filter({ has: page.getByRole('button', { name: `Edit ${name}` }) });

// ---------------------------------------------------------------- the walk

test.describe.configure({ mode: 'serial' });

test.describe('@forge-acceptance 090 US1 — Support repairs an orphaned organisation by invitation', () => {
  test.skip(!PASSWORD || !ADMIN_PASSWORD, 'E2E_USER_PASSWORD and E2E_ADMIN_PASSWORD are required');

  let support: Page;
  let invitee: Page;
  let inviteeb: Page;
  let ownerd: Page;
  let admin: Page;
  let creator: Page;
  let supportId: string;
  let owners: { orgId: string; roleSetId: string };
  let ownerCId: string;

  test.beforeAll(async ({ browser }) => {
    const sessionFor = async (identifier: string, password = PASSWORD): Promise<Page> => {
      const page = await (await browser.newContext()).newPage();
      await login(page, identifier, password);
      return page;
    };
    admin = await sessionFor(ADMIN_EMAIL, ADMIN_PASSWORD);
    creator = await sessionFor(CREATOR);
    support = await sessionFor(SUPPORT);
    invitee = await sessionFor(INVITEE);
    inviteeb = await sessionFor(INVITEEB);
    ownerd = await sessionFor(OWNER_D);

    const idOf = async (page: Page) => (await gql(page, ME)).me.user.id as string;
    supportId = await idOf(support);
    const creatorId = await idOf(creator);
    const ownerA = await sessionFor(OWNER_A);
    const ownerB = await sessionFor(OWNER_B);
    const ownerC = await sessionFor(OWNER_C);
    const [ownerAId, ownerBId] = [await idOf(ownerA), await idOf(ownerB)];
    ownerCId = await idOf(ownerC);
    for (const p of [ownerA, ownerB, ownerC]) {
      await p.context().close();
    }

    // Support-only persona + organisation creator capability.
    await gql(admin, PLATFORM_ROLE('assign'), { a: supportId, r: 'PLATFORM_SUPPORT' });
    await gql(admin, PLATFORM_ROLE('assign'), { a: creatorId, r: 'FEATURE_ORGANIZATION_CREATOR' });

    // Fixture 1 — orphan: creator removes own Admin + Associate (zero members), then activate.
    const orphan = (await gql(creator, CREATE_ORG, { n: ORPHAN_NAMEID, d: `Orphan 090 US1 ${RUN}` }))
      .createOrganization;
    await gql(creator, ROLE_SET('remove'), { a: creatorId, r: 'ADMIN', s: orphan.roleSet.id });
    await gql(creator, ROLE_SET('remove'), { a: creatorId, r: 'ASSOCIATE', s: orphan.roleSet.id });
    await gql(admin, RESET_ORG, { o: orphan.id });

    // Fixture 2 — two Owners + a third Associate (promoted to Owner mid-walk), then activate.
    const own = (await gql(creator, CREATE_ORG, { n: OWNERS_NAMEID, d: `Owners 090 US1 ${RUN}` })).createOrganization;
    owners = { orgId: own.id, roleSetId: own.roleSet.id };
    for (const id of [ownerAId, ownerBId, ownerCId]) {
      await gql(creator, ROLE_SET('assign'), { a: id, r: 'ASSOCIATE', s: owners.roleSetId });
    }
    for (const id of [ownerAId, ownerBId]) {
      await gql(creator, ROLE_SET('assign'), { a: id, r: 'OWNER', s: owners.roleSetId });
    }
    await gql(admin, RESET_ORG, { o: owners.orgId });
  });

  test.afterAll(async () => {
    for (const p of [support, invitee, inviteeb, ownerd, admin, creator]) {
      await p?.context().close();
    }
  });

  test('US1-AS1 Support lands on the Community tab with Invite enabled', async () => {
    await support.goto(`${BASE}/organization/${ORPHAN_NAMEID}/settings`);
    await expect(support).toHaveURL(new RegExp(`/organization/${ORPHAN_NAMEID}/settings/community$`));
    await expect(support.getByRole('heading', { name: 'Pending applications & invitations', exact: true })).toBeVisible();
    await expect(support.getByRole('button', { name: /Invited \(0\)/ })).toBeVisible();
    await expect(support.getByText('No pending memberships.', { exact: true })).toBeVisible();
    await expect(support.getByText('No associates yet.', { exact: true })).toBeVisible();
    await expect(support.getByRole('button', { name: /^Invite$/i })).toBeEnabled();
  });

  test('US1-AS2 Support invites a registered user offering Admin', async () => {
    await support.goto(communityUrl(ORPHAN_NAMEID));
    await inviteRegisteredUser(support, 'U1invitee ', INVITEE_NAME, 'Admin');
    await support.reload();
    await expect(support.getByRole('button', { name: /^Invited \(1\)$/ })).toBeVisible();
    await expect(support.getByRole('row').filter({ hasText: INVITEE_NAME })).toContainText('Associate + Admin');
  });

  test('US1-AS3 the invitee accepts and holds Associate + Admin', async () => {
    await acceptFromProfile(invitee, ORPHAN_NAMEID);
    await invitee.goto(communityUrl(ORPHAN_NAMEID));
    const me = memberItem(invitee, INVITEE_NAME);
    await expect(me).toContainText('Associate');
    await expect(me).toContainText('Admin');
  });

  test('US1-AS4 revoked platform-support before accept: Associate only, Admin withheld', async () => {
    await support.goto(communityUrl(ORPHAN_NAMEID));
    await inviteRegisteredUser(support, 'U1inviteeb', INVITEEB_NAME, 'Admin');
    await support.reload();
    await expect(support.getByRole('row').filter({ hasText: INVITEEB_NAME })).toContainText('Associate + Admin');

    await gql(admin, PLATFORM_ROLE('remove'), { a: supportId, r: 'PLATFORM_SUPPORT' });
    try {
      await acceptFromProfile(inviteeb, ORPHAN_NAMEID);

      // Invitee b is an Associate; the previous admin (invitee) can still see the member list.
      await invitee.goto(communityUrl(ORPHAN_NAMEID));
      const me = memberItem(invitee, INVITEEB_NAME);
      await expect(me).toContainText('Associate');
      await expect(me).not.toContainText('Admin');
    } finally {
      // Restore Support for the remaining scenarios, even when a check above failed.
      await gql(admin, PLATFORM_ROLE('assign'), { a: supportId, r: 'PLATFORM_SUPPORT' });
    }
  });

  test('US1-AS5 Owner offer withheld (role_limits) when three Owners exist at accept', async () => {
    // The invitation must be created while fewer than three Owners exist; the third Owner arrives before accept.
    await support.goto(communityUrl(OWNERS_NAMEID));
    await inviteRegisteredUser(support, 'U1ownerd', OWNER_D_NAME, 'Owner');
    await support.reload();
    await expect(support.getByRole('row').filter({ hasText: OWNER_D_NAME })).toContainText('Associate + Owner');

    await gql(creator, ROLE_SET('assign'), { a: ownerCId, r: 'OWNER', s: owners.roleSetId });
    await acceptFromProfile(ownerd, OWNERS_NAMEID);

    await support.goto(communityUrl(OWNERS_NAMEID));
    const me = memberItem(support, OWNER_D_NAME);
    await expect(me).toContainText('Associate');
    await expect(me).not.toContainText('Owner');
  });

  test('US1-AS6 email invitation is created, resent and revoked', async () => {
    await support.goto(communityUrl(ORPHAN_NAMEID));
    const dialog = await openInviteDialog(support);
    await dialog.getByPlaceholder('Username or email…').fill(UNREGISTERED);
    await dialog.getByRole('button', { name: /^Add$/i }).click();
    await dialog.getByRole('button', { name: /^Send$/i }).click();
    await support.reload();

    const row = support.getByRole('row').filter({ hasText: UNREGISTERED });
    await expect(row).toContainText('Invited (external)');

    await row.getByRole('button', { name: 'Resend invitation email' }).click();
    await expect(support.getByText('Invitation email sent again', { exact: true })).toBeVisible();

    await row.getByRole('button', { name: 'Delete' }).click();
    await support
      .getByRole('alertdialog')
      .or(support.getByRole('dialog'))
      .last()
      .getByRole('button', { name: /Revoke invitation/i })
      .click();
    await expect(support.getByRole('row').filter({ hasText: UNREGISTERED })).toHaveCount(0);
  });
});
