import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';

/**
 * @forge-acceptance
 * Platform-support organisation community administration — nothing beyond the Community tab and
 * no self-service elevation, as walked by forge-verify:
 *   - every other settings path redirects a Support-only user to /settings/community and the
 *            tab strip shows only the Community ("Associates") tab
 *   - self-targeted Support actions (invite self by actor id / own email, approve own
 *            application, promote / demote self on the Support path) are refused with
 *            "self-targeted platform-support action is not allowed"; the Owner a Support user offered
 *            to themself is withheld on accept (reason self_offer, asserted out-of-band)
 *   - a Content-Full-Access-only user gains no invite / resend / assign / remove / approve and
 *            keeps today's settings shell (by operator ruling, revoke / reject reach is NOT asserted)
 *
 * Serial: the scenarios share state. Fixture per quickstart.md §2-§3 (all env-overridable):
 *   ALKEMIO_BASE_URL            shifted Traefik origin                 (default http://localhost:23000)
 *   E2E_USER_PASSWORD           shared password of the personas        (required)
 *   E2E_SUPPORT_EMAIL           user holding ONLY platform-support     (default support090@alkem.io)
 *   E2E_CFA_EMAIL               user holding ONLY platform-content-full-access (default cfa090@alkem.io)
 *   E2E_ORPHAN_NAMEID           reset organisation, zero admins        (default orphan-090)
 *   E2E_MANAGED_NAMEID          reset organisation, Support is an Associate (default managed-090)
 *   E2E_NON_MEMBER_NAMEID       user nameID that is NOT a member of either organisation (required)
 *   E2E_PENDING_APPLICATION_ID  (optional) pending application on the managed org — enables the
 *                               Content-Full-Access approve check
 *   E2E_SELF_OFFER_INVITATION_ID (optional) pending invitation issued by Support, invitedActorId
 *                               re-targeted to Support in the DB (the public API refuses to create one),
 *                               organisation reset afterwards — enables the accept check
 *   E2E_EVIDENCE_DIR            (optional) a screenshot is written per decisive assertion
 *
 * The `organization_administration` audit rows (none for refused actions, extra_role_withheld /
 * self_offer for the accept, no '@' in details) are asserted out-of-band with the psql query in
 * quickstart.md §5.
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:23000';
const PASSWORD = process.env.E2E_USER_PASSWORD || '';
const SUPPORT = process.env.E2E_SUPPORT_EMAIL || 'support090@alkem.io';
const CFA = process.env.E2E_CFA_EMAIL || 'cfa090@alkem.io';
const ORPHAN = process.env.E2E_ORPHAN_NAMEID || 'orphan-090';
const MANAGED = process.env.E2E_MANAGED_NAMEID || 'managed-090';
const NON_MEMBER = process.env.E2E_NON_MEMBER_NAMEID || '';
const PENDING_APPLICATION_ID = process.env.E2E_PENDING_APPLICATION_ID || '';
const SELF_OFFER_INVITATION_ID = process.env.E2E_SELF_OFFER_INVITATION_ID || '';
const EVIDENCE = process.env.E2E_EVIDENCE_DIR || '';

const SELF_TARGET_REFUSAL = /self-targeted platform-support action is not allowed/;
const OTHER_SETTINGS_SEGMENTS = ['', 'profile', 'account', 'membership', 'invitations', 'settings', 'bogus'];

type GqlError = { message: string; extensions?: { code?: string } };
type GqlResult<T = Record<string, unknown>> = { data: T | null; errors?: GqlError[] };

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: /E-Mail/i }).fill(email);
  await page.getByLabel(/^Password/).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(/.*home.*/);
}

async function gql<T = Record<string, unknown>>(
  page: Page,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<GqlResult<T>> {
  const response = await page.request.post(`${BASE}/graphql`, { data: { query, variables } });
  return (await response.json()) as GqlResult<T>;
}

function expectForbidden(result: GqlResult, messagePattern?: RegExp): void {
  expect(result.errors?.length ?? 0).toBeGreaterThan(0);
  expect(result.errors?.[0].extensions?.code).toBe('FORBIDDEN_POLICY');
  if (messagePattern) {
    expect(result.errors?.[0].message).toMatch(messagePattern);
  }
}

async function shot(page: Page, name: string): Promise<void> {
  if (!EVIDENCE) return;
  mkdirSync(EVIDENCE, { recursive: true });
  await page.screenshot({ path: join(EVIDENCE, `${name}.png`), fullPage: true });
}

async function resolveOrganization(page: Page, nameID: string): Promise<{ id: string; roleSetID: string }> {
  const lookup = await gql<{ lookupByName: { organization: string } }>(
    page,
    'query($n: NameID!) { lookupByName { organization(NAMEID: $n) } }',
    { n: nameID }
  );
  const id = lookup.data?.lookupByName.organization as string;
  const org = await gql<{ organization: { roleSet: { id: string } } }>(
    page,
    'query($id: UUID!) { organization(ID: $id) { roleSet { id } } }',
    { id }
  );
  return { id, roleSetID: org.data?.organization.roleSet.id as string };
}

async function resolveUser(page: Page, nameID: string): Promise<string> {
  const lookup = await gql<{ lookupByName: { user: string } }>(
    page,
    'query($n: NameID!) { lookupByName { user(NAMEID: $n) } }',
    { n: nameID }
  );
  return lookup.data?.lookupByName.user as string;
}

const ASSIGN = 'mutation($d: AssignRoleOnRoleSetInput!) { assignRoleToUser(roleData: $d) { id } }';
const REMOVE = 'mutation($d: RemoveRoleOnRoleSetInput!) { removeRoleFromUser(roleData: $d) { id } }';
const INVITE =
  'mutation($d: InviteForEntryRoleOnRoleSetInput!) { inviteForEntryRoleOnRoleSet(invitationData: $d) { type invitation { id } } }';

test.describe.configure({ mode: 'serial' });

test.describe('@forge-acceptance 090 US3 — nothing beyond the Community tab, no self-service elevation', () => {
  test.skip(!PASSWORD || !NON_MEMBER, 'E2E_USER_PASSWORD and E2E_NON_MEMBER_NAMEID are required');

  let support: Page;
  let cfa: Page;
  let orphan: { id: string; roleSetID: string };
  let managed: { id: string; roleSetID: string };
  let supportUserID: string;
  let nonMemberUserID: string;

  test.beforeAll(async ({ browser }) => {
    support = await (await browser.newContext()).newPage();
    await login(support, SUPPORT, PASSWORD);
    cfa = await (await browser.newContext()).newPage();
    await login(cfa, CFA, PASSWORD);

    orphan = await resolveOrganization(support, ORPHAN);
    managed = await resolveOrganization(support, MANAGED);
    nonMemberUserID = await resolveUser(support, NON_MEMBER);
    const me = await gql<{ me: { user: { id: string } } }>(support, '{ me { user { id } } }');
    supportUserID = me.data?.me.user.id as string;
  });

  test.afterAll(async () => {
    await support?.context().close();
    await cfa?.context().close();
  });

  test('US3-AS1 every other settings path redirects to /settings/community with a Community-only tab strip', async () => {
    for (const segment of OTHER_SETTINGS_SEGMENTS) {
      await support.goto(`${BASE}/organization/${ORPHAN}/settings${segment ? `/${segment}` : ''}`);
      await expect(support.getByRole('heading', { name: 'Pending applications & invitations' })).toBeVisible();
      await expect(support).toHaveURL(new RegExp(`/organization/${ORPHAN}/settings/community$`));
      await expect(support.getByRole('tab')).toHaveCount(1);
      await expect(support.getByRole('tab', { name: 'Associates' })).toHaveAttribute('aria-selected', 'true');
      await shot(support, `US3-AS1-${segment || 'root'}-redirect-community-only`);
    }
  });

  test('US3-AS4 self-targeted Support actions are refused (invite self, promote / demote self, approve own application)', async () => {
    // invite self — by actor id and by own email
    expectForbidden(
      await gql(support, INVITE, {
        d: {
          roleSetID: managed.roleSetID,
          invitedActorIDs: [supportUserID],
          invitedUserEmails: [],
          extraRoles: ['ADMIN'],
        },
      }),
      SELF_TARGET_REFUSAL
    );
    expectForbidden(
      await gql(support, INVITE, {
        d: { roleSetID: managed.roleSetID, invitedActorIDs: [], invitedUserEmails: [SUPPORT], extraRoles: [] },
      }),
      SELF_TARGET_REFUSAL
    );

    // promote / demote / remove self on the Support path (Admin and Owner). Removing the Associate role is
    // the ordinary self-leave (spec edge case) and is deliberately not asserted here.
    for (const role of ['ADMIN', 'OWNER']) {
      expectForbidden(
        await gql(support, ASSIGN, { d: { roleSetID: managed.roleSetID, actorID: supportUserID, role } }),
        SELF_TARGET_REFUSAL
      );
      expectForbidden(
        await gql(support, REMOVE, { d: { roleSetID: managed.roleSetID, actorID: supportUserID, role } }),
        SELF_TARGET_REFUSAL
      );
    }

    // approve own application (Support is not a member of the orphan organisation). Re-runnable: an open
    // application left by an earlier run is reused instead of re-applied.
    const applied = await gql<{ applyForEntryRoleOnRoleSet: { id: string } }>(
      support,
      'mutation($d: ApplyForEntryRoleOnRoleSetInput!) { applyForEntryRoleOnRoleSet(applicationData: $d) { id } }',
      { d: { roleSetID: orphan.roleSetID, questions: [] } }
    );
    const existing = await gql<{ lookup: { roleSet: { applications: Array<{ id: string; user: { id: string } }> } } }>(
      support,
      'query($id: UUID!) { lookup { roleSet(ID: $id) { applications { id user { id } } } } }',
      { id: orphan.roleSetID }
    );
    const applicationID =
      applied.data?.applyForEntryRoleOnRoleSet.id ??
      existing.data?.lookup.roleSet.applications.find(a => a.user.id === supportUserID)?.id;
    expect(applicationID, "Support's own open application on the orphan organisation").toBeTruthy();
    expectForbidden(
      await gql(support, 'mutation($d: ApplicationEventInput!) { eventOnApplication(eventData: $d) { id } }', {
        d: { applicationID, eventName: 'APPROVE' },
      }),
      SELF_TARGET_REFUSAL
    );
    await support.goto(`${BASE}/organization/${ORPHAN}/settings/community`);
    await expect(support.getByRole('heading', { name: 'Pending applications & invitations' })).toBeVisible();
    await shot(support, 'US3-AS4-own-application-still-pending');
  });

  test('US3-AS4 (accept) the Owner Support offered to themself is withheld, not granted', async () => {
    test.skip(!SELF_OFFER_INVITATION_ID, 'E2E_SELF_OFFER_INVITATION_ID (fixture-seeded) is required');
    const accepted = await gql<{ eventOnInvitation: { state: string; extraRolesWithheld: string[] } }>(
      support,
      'mutation($d: InvitationEventInput!) { eventOnInvitation(eventData: $d) { id state extraRolesWithheld } }',
      { d: { invitationID: SELF_OFFER_INVITATION_ID, eventName: 'ACCEPT' } }
    );
    expect(accepted.errors).toBeUndefined();
    expect(accepted.data?.eventOnInvitation.state).toBe('accepted');
    expect(accepted.data?.eventOnInvitation.extraRolesWithheld).toEqual(['OWNER']);

    const owners = await gql<{ lookup: { roleSet: { owners: Array<{ id: string }> } } }>(
      support,
      'query($id: UUID!) { lookup { roleSet(ID: $id) { owners: usersInRole(role: OWNER) { id } } } }',
      { id: managed.roleSetID }
    );
    expect(owners.data?.lookup.roleSet.owners.map(o => o.id) ?? []).not.toContain(supportUserID);
  });

  test('US3-AS5 Content Full Access alone gains no invite/resend/assign/remove/approve; settings shell unchanged', async () => {
    expectForbidden(
      await gql(cfa, INVITE, {
        d: { roleSetID: managed.roleSetID, invitedActorIDs: [nonMemberUserID], invitedUserEmails: [], extraRoles: [] },
      })
    );
    expectForbidden(
      await gql(cfa, INVITE, {
        d: {
          roleSetID: managed.roleSetID,
          invitedActorIDs: [],
          invitedUserEmails: ['nobody-090@example.org'],
          extraRoles: [],
        },
      })
    );
    expectForbidden(
      await gql(cfa, ASSIGN, { d: { roleSetID: managed.roleSetID, actorID: nonMemberUserID, role: 'ASSOCIATE' } })
    );
    expectForbidden(
      await gql(cfa, ASSIGN, { d: { roleSetID: managed.roleSetID, actorID: supportUserID, role: 'ADMIN' } })
    );
    expectForbidden(
      await gql(cfa, REMOVE, { d: { roleSetID: managed.roleSetID, actorID: supportUserID, role: 'ADMIN' } })
    );

    if (PENDING_APPLICATION_ID) {
      // The lifecycle guard needs GRANT, which Content Full Access lacks: the event is a silent no-op
      // (revoke / reject reach is NOT asserted, by operator ruling).
      const result = await gql<{ eventOnApplication: { state: string } }>(
        cfa,
        'mutation($d: ApplicationEventInput!) { eventOnApplication(eventData: $d) { id state } }',
        { d: { applicationID: PENDING_APPLICATION_ID, eventName: 'APPROVE' } }
      );
      if (!result.errors) {
        expect(result.data?.eventOnApplication.state).toBe('new');
      }
    }

    // Settings shell as today: no Community-only confinement — profile tab reachable, more than one tab.
    await cfa.goto(`${BASE}/organization/${MANAGED}/settings/profile`);
    await expect(cfa.getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true');
    await expect(cfa).toHaveURL(new RegExp(`/organization/${MANAGED}/settings/profile$`));
    expect(await cfa.getByRole('tab').count()).toBeGreaterThan(1);
    await shot(cfa, 'US3-AS5-cfa-settings-shell-unchanged');
  });
});
