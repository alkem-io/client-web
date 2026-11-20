import { expect, type Page, test } from '@playwright/test';

/**
 * @forge-acceptance
 * Platform-support organisation community administration — User Story 3
 * "Nothing beyond the Community tab, and no self-service elevation" (US3-AS1 .. AS6).
 *
 * Runs serially against a live stack (the scenarios share state). Pre-seeded fixture
 * (quickstart.md §2-§3) — all names are env-overridable:
 *   E2E_USER_PASSWORD          shared password of the personas below
 *   E2E_SUPPORT_EMAIL          user holding ONLY platform-support          (default support090@alkem.io)
 *   E2E_CFA_EMAIL              user holding ONLY platform-content-full-access (default cfa090@alkem.io)
 *   E2E_CREATOR_EMAIL          org admin of the managed org (AS6 setup)     (default creator090@alkem.io)
 *   E2E_ADMIN_EMAIL/_PASSWORD  platform admin able to run authorizationPolicyResetOnOrganization (AS6)
 *   E2E_ORPHAN_NAMEID          reset organisation with zero admins          (default orphan-090)
 *   E2E_MANAGED_NAMEID         reset organisation; Support is an Associate  (default managed-090)
 *   E2E_NON_MEMBER_NAMEID      user nameID that is NOT a member of either org (default supportb-ninety)
 *   E2E_AS6_INVITEE_EMAIL/_NAME registered user (email + display name), not a member of the managed org
 *                              (default invitee090b@alkem.io / "InviteeB Ninety")
 *   E2E_PENDING_APPLICATION_ID (optional) pending application on the managed org; enables the
 *                              Content-Full-Access approve check
 *   E2E_SELF_OFFER_INVITATION_ID (optional) a pending invitation issued by Support to Support
 *                              offering Owner. The public API refuses to create one (AS4), so it must
 *                              be fixture-seeded (re-target an invitation's invitedActorId in the DB,
 *                              then authorizationPolicyResetOnOrganization). Enables the accept check.
 *
 * Self-targeted applications (AS4) need a non-member Support user: the Support persona applies to the
 * orphan organisation, which leaves one pending application behind.
 *
 * The `organization_administration` audit rows (reason self_offer on the withheld Owner; exactly one
 * revoke_user_invitation row for AS6; none for refused actions; no '@' in details) are asserted
 * out-of-band with the psql query in quickstart.md §5.
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:23000';
const PASSWORD = process.env.E2E_USER_PASSWORD || '';
const SUPPORT = process.env.E2E_SUPPORT_EMAIL || 'support090@alkem.io';
const CFA = process.env.E2E_CFA_EMAIL || 'cfa090@alkem.io';
const CREATOR = process.env.E2E_CREATOR_EMAIL || 'creator090@alkem.io';
const ADMIN = process.env.E2E_ADMIN_EMAIL || 'admin@alkem.io';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';
const ORPHAN = process.env.E2E_ORPHAN_NAMEID || 'orphan-090';
const MANAGED = process.env.E2E_MANAGED_NAMEID || 'managed-090';
const NON_MEMBER = process.env.E2E_NON_MEMBER_NAMEID || 'supportb-ninety';
const AS6_INVITEE_EMAIL = process.env.E2E_AS6_INVITEE_EMAIL || 'invitee090b@alkem.io';
const AS6_INVITEE_NAME = process.env.E2E_AS6_INVITEE_NAME || 'InviteeB Ninety';
const PENDING_APPLICATION_ID = process.env.E2E_PENDING_APPLICATION_ID || '';
const SELF_OFFER_INVITATION_ID = process.env.E2E_SELF_OFFER_INVITATION_ID || '';

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
  test.skip(!PASSWORD, 'E2E_USER_PASSWORD is required');

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
    }
  });

  test('US3-AS2 no direct add: assigning Associate/Admin/Owner to a non-member is refused; no UI control either', async () => {
    for (const role of ['ASSOCIATE', 'ADMIN', 'OWNER']) {
      const result = await gql(support, ASSIGN, {
        d: { roleSetID: managed.roleSetID, actorID: nonMemberUserID, role },
      });
      expectForbidden(result);
    }

    // The tab offers an invitation flow only: the Invite dialog has no "add directly" control and the
    // per-member Edit dialog exists only for people who are already Associates.
    await support.goto(`${BASE}/organization/${MANAGED}/settings/community`);
    await support.getByRole('button', { name: 'Invite', exact: true }).click();
    const dialog = support.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: /Invite associates to/ })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /^(Add|Add directly|Add member)/i })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Send' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Close invite dialog' }).click();
  });

  test('US3-AS3 application form, organisation profile and settings updates are refused', async () => {
    expectForbidden(
      await gql(
        support,
        'mutation($d: UpdateApplicationFormOnRoleSetInput!) { updateApplicationFormOnRoleSet(applicationFormData: $d) { id } }',
        { d: { roleSetID: managed.roleSetID, formData: { description: 'x', questions: [] } } }
      )
    );
    expectForbidden(
      await gql(support, 'mutation($d: UpdateOrganizationInput!) { updateOrganization(organizationData: $d) { id } }', {
        d: { ID: managed.id, legalEntityName: 'Not allowed' },
      })
    );
    expectForbidden(
      await gql(
        support,
        'mutation($d: UpdateOrganizationSettingsInput!) { updateOrganizationSettings(settingsData: $d) { id } }',
        { d: { organizationID: managed.id, settings: { membership: { allowApplications: false } } } }
      )
    );
  });

  test('US3-AS4 self-targeted Support actions are refused; a self-offered Owner is withheld', async () => {
    // invite self (by actor id and by own email)
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

    // promote / demote self
    for (const role of ['ADMIN', 'OWNER']) {
      expectForbidden(
        await gql(support, ASSIGN, { d: { roleSetID: managed.roleSetID, actorID: supportUserID, role } }),
        SELF_TARGET_REFUSAL
      );
    }
    expectForbidden(
      await gql(support, REMOVE, { d: { roleSetID: managed.roleSetID, actorID: supportUserID, role: 'ADMIN' } }),
      SELF_TARGET_REFUSAL
    );

    // approve own application (the Support persona is not a member of the orphan organisation).
    // Re-runnable: an open application left by an earlier run is reused instead of re-applied.
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
  });

  test('US3-AS4 (accept) the Owner Support offered to themself is withheld, not granted', async () => {
    test.skip(!SELF_OFFER_INVITATION_ID, 'E2E_SELF_OFFER_INVITATION_ID (fixture-seeded) is required');
    const accepted = await gql<{ eventOnInvitation: { state: string } }>(
      support,
      'mutation($d: InvitationEventInput!) { eventOnInvitation(eventData: $d) { id state } }',
      { d: { invitationID: SELF_OFFER_INVITATION_ID, eventName: 'ACCEPT' } }
    );
    expect(accepted.errors).toBeUndefined();
    expect(accepted.data?.eventOnInvitation.state).toBe('accepted');

    // Support stays a plain Associate: the member list shows no Owner/Admin chip against them.
    await support.goto(`${BASE}/organization/${MANAGED}/settings/community`);
    const ownRow = support
      .getByRole('listitem')
      .filter({ has: support.getByRole('button', { name: /^Edit Support/ }) });
    await expect(ownRow).toContainText('Associate');
    await expect(ownRow).not.toContainText('Owner');
    await expect(ownRow).not.toContainText('Admin');
  });

  test('US3-AS5 Content Full Access alone gains no invite/resend/assign/remove/approve; settings shell unchanged', async () => {
    const firstRoleSet = managed.roleSetID;

    expectForbidden(
      await gql(cfa, INVITE, {
        d: { roleSetID: firstRoleSet, invitedActorIDs: [nonMemberUserID], invitedUserEmails: [], extraRoles: [] },
      })
    );
    expectForbidden(
      await gql(cfa, INVITE, {
        d: {
          roleSetID: firstRoleSet,
          invitedActorIDs: [],
          invitedUserEmails: ['nobody-090@example.org'],
          extraRoles: [],
        },
      })
    );
    expectForbidden(await gql(cfa, ASSIGN, { d: { roleSetID: firstRoleSet, actorID: supportUserID, role: 'ADMIN' } }));
    expectForbidden(
      await gql(cfa, ASSIGN, { d: { roleSetID: firstRoleSet, actorID: nonMemberUserID, role: 'ASSOCIATE' } })
    );
    expectForbidden(
      await gql(cfa, REMOVE, { d: { roleSetID: firstRoleSet, actorID: supportUserID, role: 'ASSOCIATE' } })
    );

    if (PENDING_APPLICATION_ID) {
      // The lifecycle guard needs GRANT: the event is accepted by the pre-existing root cascade but the
      // application must not leave "new" (orchestrator narrowing: revoke/reject reach is NOT asserted).
      const result = await gql<{ eventOnApplication: { state: string } }>(
        cfa,
        'mutation($d: ApplicationEventInput!) { eventOnApplication(eventData: $d) { id state } }',
        { d: { applicationID: PENDING_APPLICATION_ID, eventName: 'APPROVE' } }
      );
      if (!result.errors) {
        expect(result.data?.eventOnApplication.state).toBe('new');
      }
    }

    // Settings shell as today: no community-only confinement — the full tab strip and no redirect.
    await cfa.goto(`${BASE}/organization/${MANAGED}/settings/profile`);
    await expect(cfa.getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true');
    await expect(cfa).toHaveURL(new RegExp(`/organization/${MANAGED}/settings/profile$`));
    await expect(cfa.getByRole('tab')).toHaveCount(6);
    await cfa.goto(`${BASE}/organization/${MANAGED}/settings/community`);
    await expect(cfa.getByRole('heading', { name: 'Pending applications & invitations' })).toBeVisible();
    await expect(cfa.getByRole('button', { name: 'Invite', exact: true })).toBeDisabled();
  });

  test('US3-AS6 reset is idempotent and a pre-reset pending invitation is revocable by Support', async ({
    browser,
  }) => {
    test.skip(!ADMIN_PASSWORD, 'E2E_ADMIN_PASSWORD is required');

    // A pending invitation that exists BEFORE the resets (issued by the org admin).
    const creator = await (await browser.newContext()).newPage();
    await login(creator, CREATOR, PASSWORD);
    const invited = await gql<{ inviteForEntryRoleOnRoleSet: Array<{ invitation: { id: string } | null }> }>(
      creator,
      INVITE,
      {
        d: {
          roleSetID: managed.roleSetID,
          invitedActorIDs: [],
          invitedUserEmails: [AS6_INVITEE_EMAIL],
          extraRoles: [],
        },
      }
    );
    expect(invited.errors).toBeUndefined();
    expect(invited.data?.inviteForEntryRoleOnRoleSet[0].invitation?.id).toBeTruthy();
    await creator.context().close();

    // The admin resets the organisation twice; both succeed (idempotent).
    const admin = await (await browser.newContext()).newPage();
    await login(admin, ADMIN, ADMIN_PASSWORD);
    for (let run = 0; run < 2; run++) {
      const reset = await gql<{ authorizationPolicyResetOnOrganization: { id: string } }>(
        admin,
        'mutation($d: OrganizationAuthorizationResetInput!) { authorizationPolicyResetOnOrganization(authorizationResetData: $d) { id } }',
        { d: { organizationID: managed.id } }
      );
      expect(reset.errors).toBeUndefined();
      expect(reset.data?.authorizationPolicyResetOnOrganization.id).toBe(managed.id);
    }
    await admin.context().close();

    // Support opens the organisation (US1-AS1 holds) ...
    await support.goto(`${BASE}/organization/${MANAGED}/settings`);
    await expect(support.getByRole('heading', { name: 'Pending applications & invitations' })).toBeVisible();
    await expect(support).toHaveURL(new RegExp(`/organization/${MANAGED}/settings/community$`));
    await expect(support.getByRole('tab')).toHaveCount(1);
    await expect(support.getByRole('button', { name: 'Invite', exact: true })).toBeEnabled();

    // ... and revokes the pre-reset invitation (one revoke_user_invitation audit row, asserted out-of-band).
    const row = support.getByRole('row').filter({ hasText: AS6_INVITEE_NAME });
    await expect(row.getByRole('cell', { name: 'Invited', exact: true })).toBeVisible();
    await row.getByRole('button', { name: 'Delete' }).click();
    await support
      .getByRole('alertdialog')
      .or(support.getByRole('dialog'))
      .getByRole('button', { name: /Revoke invitation/i })
      .click();
    await expect(support.getByRole('alertdialog')).toBeHidden();
    await expect(support.getByRole('button', { name: /^Invited \(0\)$/ })).toBeVisible();
  });
});
