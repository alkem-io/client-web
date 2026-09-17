import { ApolloError } from '@apollo/client';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { RELEVANT_ROLES } from '@/domain/access/RoleSetManager/useRoleSetManager';
import CrdAdminGlobalRolesPage from '../CrdAdminGlobalRolesPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

let mockPathname = '/admin/authorization/roles/PLATFORM_ROLES_ADMIN';
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
}));

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({ default: () => navigateMock }));

// corr-client-web-4: `usePlatformRoleSetQuery`'s own `loading` must fold into
// the page's overall "privileges pending" gate — a cold cache (or a
// post-mutation cache eviction re-triggering the read) must not read as "no
// assignable privilege".
let mockLoadingRoleSetId = false;
let mockRoleSetData: { platform: { roleSet: { id: string } } } | undefined = {
  platform: { roleSet: { id: 'rs1' } },
};
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformRoleSetQuery: () => ({ data: mockRoleSetData, loading: mockLoadingRoleSetId }),
}));

// FR-012: `myPrivileges` is the only signal the offered-role filter reads. Tests
// drive it directly rather than mocking `getOfferedPlatformRoles` itself, so the
// real filter (from useRoleSetManager.ts) is what's under test here (T008).
// corr-client-web-8: a Platform Roles Admin holds BOTH `PLATFORM_ROLES_ASSIGN`
// and `FEATURE_ROLE_ASSIGN` server-side — the default persona for tests that
// don't override privileges is that combined holder, so they still see all 14
// target roles. A bare `PLATFORM_ROLES_ASSIGN` holder is exercised explicitly
// in the assigner-capability-filter describe block below.
let mockMyPrivileges: AuthorizationPrivilege[] | undefined = [
  AuthorizationPrivilege.PlatformRolesAssign,
  AuthorizationPrivilege.FeatureRoleAssign,
];
// corr-client-web-3: distinguishes "still fetching myPrivileges" from "fetched,
// offers nothing" — the phase-1 `useRoleSetManager({ relevantRoles: [] })` call.
let mockLoadingPrivileges = false;
// sec-client-web-2: the holder-list read was attempted but is unreachable
// (privilege gap or query error) — distinct from a genuinely empty list.
// spec-clientweb-2/sec-client-web-3: this is the TARGET-role read's own flag —
// that a denial on one request never contaminates the other (FR-032, two
// separate `useRoleSetManager` calls).
let mockHoldersUnavailable = false;

type MockUsersByRole = Record<string, Array<{ id: string; profile: { displayName: string }; email?: string }>>;
const baseUsersByRole: MockUsersByRole = {
  PLATFORM_ROLES_ADMIN: [{ id: 'u1', profile: { displayName: 'Alice' }, email: 'alice@x.io' }],
};
const usersByRole: MockUsersByRole = baseUsersByRole;
const organizationsByRole = {
  FEATURE_BETA_TESTER: [{ id: 'o1', profile: { displayName: 'Acme Org' } }],
};

const assignPlatformRoleToUser = vi.fn();
const removePlatformRoleFromUser = vi.fn();
const assignPlatformRoleToOrganization = vi.fn();
const removePlatformRoleFromOrganization = vi.fn();

vi.mock('@/domain/access/RoleSetManager/useRoleSetManager', async importOriginal => {
  const actual = await importOriginal<typeof import('@/domain/access/RoleSetManager/useRoleSetManager')>();
  return {
    ...actual,
    // T013 (Slice B): the page now issues TWO calls, not three — phase 1 with
    // `relevantRoles: []` (myPrivileges only) and phase 2 with the offered
    // target-role set (holder data + mutations). Phase 3, the legacy role set's
    // own request, went with the legacy panel. The two that remain must STILL not
    // be combined: the server fails a holder-list read closed as a whole (T051a).
    // `mockLoadingPrivileges` only applies to the phase-1 call.
    default: ({ relevantRoles }: { relevantRoles: readonly unknown[] }) => {
      if (relevantRoles.length === 0) {
        return {
          myPrivileges: mockMyPrivileges,
          usersByRole: {},
          organizationsByRole: {},
          assignPlatformRoleToUser,
          removePlatformRoleFromUser,
          assignPlatformRoleToOrganization,
          removePlatformRoleFromOrganization,
          loading: mockLoadingPrivileges,
          updating: false,
          holdersUnavailable: false,
        };
      }
      return {
        myPrivileges: mockMyPrivileges,
        usersByRole,
        organizationsByRole,
        assignPlatformRoleToUser,
        removePlatformRoleFromUser,
        assignPlatformRoleToOrganization,
        removePlatformRoleFromOrganization,
        loading: false,
        updating: false,
        holdersUnavailable: mockHoldersUnavailable,
      };
    },
  };
});

const fetchMore = vi.fn();
vi.mock('@/domain/access/AvailableContributors/useRoleSetAvailableUsers', () => ({
  default: () => ({
    users: [{ id: 'u2', profile: { displayName: 'Bob' }, email: 'bob@x.io' }],
    fetchMore,
    hasMore: false,
    loading: false,
  }),
}));

const fetchMoreOrganizations = vi.fn();
vi.mock('@/domain/access/AvailableContributors/useRoleSetAvailableOrganizationsOnPlatform', () => ({
  default: () => ({
    organizations: [{ id: 'o2', profile: { displayName: 'Beta Org' } }],
    fetchMore: fetchMoreOrganizations,
    hasMore: false,
    loading: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockPathname = '/admin/authorization/roles/PLATFORM_ROLES_ADMIN';
  mockMyPrivileges = [AuthorizationPrivilege.PlatformRolesAssign, AuthorizationPrivilege.FeatureRoleAssign];
  mockLoadingPrivileges = false;
  mockHoldersUnavailable = false;
  mockLoadingRoleSetId = false;
  mockRoleSetData = { platform: { roleSet: { id: 'rs1' } } };
});

describe('CrdAdminGlobalRolesPage', () => {
  test('offers all fourteen target roles as selectable tabs for a Platform Roles Admin', () => {
    render(<CrdAdminGlobalRolesPage />);
    const nav = screen.getByRole('navigation');
    expect(within(nav).getAllByRole('button')).toHaveLength(14);
    for (const role of RELEVANT_ROLES.Platform) {
      expect(within(nav).getByRole('button', { name: `roles.${role}` })).toBeInTheDocument();
    }
  });

  test('every offered role renders its label and description when selected', () => {
    for (const role of RELEVANT_ROLES.Platform) {
      mockPathname = `/admin/authorization/roles/${role}`;
      const { unmount } = render(<CrdAdminGlobalRolesPage />);
      const nav = screen.getByRole('navigation');
      expect(within(nav).getByRole('button', { name: `roles.${role}` })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText(`roleDescriptions.${role}`)).toBeInTheDocument();
      unmount();
    }
  });

  test('renders the Platform Operations Admin label and its role description when selected', () => {
    mockPathname = '/admin/authorization/roles/PLATFORM_OPERATIONS_ADMIN';
    render(<CrdAdminGlobalRolesPage />);
    const nav = screen.getByRole('navigation');
    const tab = within(nav).getByRole('button', { name: 'roles.PLATFORM_OPERATIONS_ADMIN' });
    expect(tab).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('roleDescriptions.PLATFORM_OPERATIONS_ADMIN')).toBeInTheDocument();
  });

  test('lists the current members and available users for the selected role', () => {
    render(<CrdAdminGlobalRolesPage />);
    expect(screen.getByText('Alice (alice@x.io)')).toBeInTheDocument();
    expect(screen.getByText('Bob (bob@x.io)')).toBeInTheDocument();
  });

  test('selecting a role navigates to its URL', async () => {
    render(<CrdAdminGlobalRolesPage />);
    const nav = screen.getByRole('navigation');
    await userEvent.click(within(nav).getByRole('button', { name: 'roles.PLATFORM_CONTENT_FULL_ACCESS' }));
    expect(navigateMock).toHaveBeenCalledWith('/admin/authorization/roles/PLATFORM_CONTENT_FULL_ACCESS');
  });

  test('adding an available user assigns the selected role', async () => {
    render(<CrdAdminGlobalRolesPage />);
    await userEvent.click(screen.getByRole('button', { name: 'roleMembers.add' }));
    expect(assignPlatformRoleToUser).toHaveBeenCalledWith('u2', 'PLATFORM_ROLES_ADMIN');
  });

  test('removing a member (after confirm) revokes the selected role', async () => {
    render(<CrdAdminGlobalRolesPage />);
    await userEvent.click(screen.getByRole('button', { name: 'roleMembers.remove' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'roleMembers.remove' }));
    expect(removePlatformRoleFromUser).toHaveBeenCalledWith('u1', 'PLATFORM_ROLES_ADMIN');
  });

  test('filtering current members narrows the list client-side without refetching', async () => {
    render(<CrdAdminGlobalRolesPage />);
    expect(screen.getByText('Alice (alice@x.io)')).toBeInTheDocument();

    const filter = screen.getByPlaceholderText('roleMembers.filterMembersPlaceholder');
    await userEvent.type(filter, 'ali');
    expect(screen.getByText('Alice (alice@x.io)')).toBeInTheDocument(); // matches name

    await userEvent.clear(filter);
    await userEvent.type(filter, 'zzz');
    expect(screen.queryByText('Alice (alice@x.io)')).toBeNull(); // filtered out
    expect(screen.getByText('roleMembers.noResults')).toBeInTheDocument();
  });

  // T008 [US2]: the assigner filter (FR-012) — no reimplementation of any
  // server rule, just the offer/deny split driven by `myPrivileges`.
  describe('assigner-capability filter (FR-012)', () => {
    test('a holder of only FEATURE_ROLE_ASSIGN is offered exactly the 4 Feature roles', () => {
      mockMyPrivileges = [AuthorizationPrivilege.FeatureRoleAssign];
      mockPathname = '/admin/authorization/roles/FEATURE_BETA_TESTER';
      render(<CrdAdminGlobalRolesPage />);
      const nav = screen.getByRole('navigation');
      const buttons = within(nav).getAllByRole('button');
      expect(buttons).toHaveLength(4);
      expect(within(nav).getByRole('button', { name: 'roles.FEATURE_BETA_TESTER' })).toBeInTheDocument();
      expect(within(nav).getByRole('button', { name: 'roles.FEATURE_VIRTUAL_ASSISTANT' })).toBeInTheDocument();
      expect(within(nav).getByRole('button', { name: 'roles.FEATURE_ORGANIZATION_CREATOR' })).toBeInTheDocument();
      expect(within(nav).getByRole('button', { name: 'roles.FEATURE_VC_CAMPAIGN' })).toBeInTheDocument();
      expect(within(nav).queryByRole('button', { name: 'roles.PLATFORM_ROLES_ADMIN' })).toBeNull();
    });

    test('a holder of PLATFORM_ROLES_ASSIGN and FEATURE_ROLE_ASSIGN (Platform Roles Admin) is offered all 14 roles', () => {
      mockMyPrivileges = [AuthorizationPrivilege.PlatformRolesAssign, AuthorizationPrivilege.FeatureRoleAssign];
      render(<CrdAdminGlobalRolesPage />);
      const nav = screen.getByRole('navigation');
      expect(within(nav).getAllByRole('button')).toHaveLength(14);
    });

    // corr-client-web-8: a bare PLATFORM_ROLES_ASSIGN holder (the legacy
    // `global-admin` credential) does NOT hold FEATURE_ROLE_ASSIGN server-side —
    // it must be offered only the 10 `Platform …` roles, never the 3 `Feature …`
    // roles the server would reject on assign/revoke.
    test('a bare holder of PLATFORM_ROLES_ASSIGN (legacy global-admin) is offered only the 10 platform admin roles', () => {
      mockMyPrivileges = [AuthorizationPrivilege.PlatformRolesAssign];
      render(<CrdAdminGlobalRolesPage />);
      const nav = screen.getByRole('navigation');
      const buttons = within(nav).getAllByRole('button');
      expect(buttons).toHaveLength(10);
      expect(within(nav).queryByRole('button', { name: 'roles.FEATURE_BETA_TESTER' })).toBeNull();
      expect(within(nav).queryByRole('button', { name: 'roles.FEATURE_VIRTUAL_ASSISTANT' })).toBeNull();
      expect(within(nav).queryByRole('button', { name: 'roles.FEATURE_ORGANIZATION_CREATOR' })).toBeNull();
      expect(within(nav).queryByRole('button', { name: 'roles.FEATURE_VC_CAMPAIGN' })).toBeNull();
    });

    // corr-client-web-3: a holder of neither privilege gets an explicit,
    // translated empty state — not a blank nav indistinguishable from a
    // broken page.
    test('a holder of neither assignment privilege sees an explicit empty state, no nav', () => {
      mockMyPrivileges = [];
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.queryByRole('navigation')).toBeNull();
      expect(screen.getByText('roleMembers.noAssignablePrivilege')).toBeInTheDocument();
    });
  });

  // corr-client-web-3: the loading and empty states must be distinguishable —
  // neither renders an indistinguishable blank panel.
  describe('loading and empty states (corr-client-web-3)', () => {
    test('shows a loading indicator while myPrivileges is still loading, no nav yet', () => {
      mockLoadingPrivileges = true;
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByRole('navigation')).toBeNull();
      expect(screen.queryByText('roleMembers.noAssignablePrivilege')).toBeNull();
    });

    test('once loaded, a holder of an assignment privilege sees the nav, not the loading indicator', () => {
      mockLoadingPrivileges = false;
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.queryByRole('status')).toBeNull();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  // sec-client-web-2: "read denied/unreachable" must not look like "no holders".
  describe('holder read unavailable (sec-client-web-2)', () => {
    test('renders an explicit unavailable message instead of the misleading noMembers state', () => {
      mockHoldersUnavailable = true;
      mockPathname = '/admin/authorization/roles/PLATFORM_AUDIT_READER';
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.getByRole('alert')).toHaveTextContent('roleMembers.holdersUnavailable');
      expect(screen.queryByText('roleMembers.noMembers')).toBeNull();
    });

    test('renders the normal noMembers state when the read is not flagged unavailable', () => {
      mockHoldersUnavailable = false;
      mockPathname = '/admin/authorization/roles/PLATFORM_AUDIT_READER';
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.getByText('roleMembers.noMembers')).toBeInTheDocument();
      expect(screen.queryByText('roleMembers.holdersUnavailable')).toBeNull();
    });
  });

  // T007a / SC-009: the organization holder-kind section exists only on the
  // 3 `Feature …` roles — never on a `Platform …` role.
  describe('organization holder kind (SC-009)', () => {
    test('shows the organization section for a Feature role', () => {
      mockPathname = '/admin/authorization/roles/FEATURE_BETA_TESTER';
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.getByText('roleMembers.organizations')).toBeInTheDocument();
      expect(screen.getByText('Acme Org')).toBeInTheDocument();
      expect(screen.getByText('Beta Org')).toBeInTheDocument();
    });

    test('hides the organization section for a Platform role', () => {
      mockPathname = '/admin/authorization/roles/PLATFORM_ROLES_ADMIN';
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.queryByText('roleMembers.organizations')).toBeNull();
    });
  });

  // qual-clientweb-3: T007a's add/remove wiring for the organization holder
  // kind had no coverage beyond "the names render" — pin that the two
  // organization mutations are called with the right (id, role) pair, and
  // that neither falls through to the user mutation.
  describe('organization holder kind — mutation wiring (qual-clientweb-3)', () => {
    test('adding an available organization calls assignPlatformRoleToOrganization, never the user mutation', async () => {
      mockPathname = '/admin/authorization/roles/FEATURE_BETA_TESTER';
      render(<CrdAdminGlobalRolesPage />);
      const addOrganizationsHeading = screen.getByText('roleMembers.addOrganizations');
      const addOrganizationsSection = addOrganizationsHeading.closest('section');
      if (!addOrganizationsSection) throw new Error('organization "add" section not found');
      await userEvent.click(within(addOrganizationsSection).getByRole('button', { name: 'roleMembers.add' }));
      expect(assignPlatformRoleToOrganization).toHaveBeenCalledWith('o2', 'FEATURE_BETA_TESTER');
      expect(assignPlatformRoleToUser).not.toHaveBeenCalled();
    });

    test('removing an organization (after confirm) calls removePlatformRoleFromOrganization, never the user mutation', async () => {
      mockPathname = '/admin/authorization/roles/FEATURE_BETA_TESTER';
      render(<CrdAdminGlobalRolesPage />);
      // FEATURE_BETA_TESTER has no mocked user holders, so the sole "remove"
      // button rendered in this scenario belongs to the organization column.
      await userEvent.click(screen.getByRole('button', { name: 'roleMembers.remove' }));
      const dialog = screen.getByRole('alertdialog');
      // Organization removals use the distinct `removeOrganization` confirm
      // label (RoleMembersEditor.tsx:~254) — pinning it here also guards
      // that the confirm dialog's holder-kind discrimination stays wired.
      await userEvent.click(within(dialog).getByRole('button', { name: 'roleMembers.removeOrganization' }));
      expect(removePlatformRoleFromOrganization).toHaveBeenCalledWith('o1', 'FEATURE_BETA_TESTER');
      expect(removePlatformRoleFromUser).not.toHaveBeenCalled();
    });
  });

  // qual-clientweb-2: FR-012's verbatim server-rejection surfacing (T007) had
  // no coverage at any level — pin the exact wiring: a rejected mutation sets
  // the inline error, and `extractErrorMessage` prefers `graphQLErrors[0].message`.
  describe('assignment rejection surfacing (qual-clientweb-2)', () => {
    test('renders the exact server rejection message on a rejected grant', async () => {
      assignPlatformRoleToUser.mockRejectedValueOnce(
        new ApolloError({ graphQLErrors: [{ message: 'Assigner capability: you may not grant this role.' }] })
      );
      render(<CrdAdminGlobalRolesPage />);
      await userEvent.click(screen.getByRole('button', { name: 'roleMembers.add' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Assigner capability: you may not grant this role.');
    });

    test('renders the exact server rejection message on a rejected revoke', async () => {
      removePlatformRoleFromUser.mockRejectedValueOnce(
        new ApolloError({ graphQLErrors: [{ message: 'Last Roles Admin: cannot remove the final holder.' }] })
      );
      render(<CrdAdminGlobalRolesPage />);
      await userEvent.click(screen.getByRole('button', { name: 'roleMembers.remove' }));
      const dialog = screen.getByRole('alertdialog');
      await userEvent.click(within(dialog).getByRole('button', { name: 'roleMembers.remove' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Last Roles Admin: cannot remove the final holder.');
    });
  });

  // 027-platform-role-redesign (T013, Slice B): the legacy-platform-roles panel
  // suite is deleted with the panel.
  //
  // It covered the sec-client-web-1 incident-response surface for the additive
  // window — revoke-only, gated on plain READ + GRANT rather than the assignment
  // privilege (sec-client-web-4/spec-clientweb-3), because the server's legacy
  // revoke branch honoured a resolver-local `[GLOBAL_ADMIN]` policy and would have
  // rejected a bare Platform Roles Admin's click. Server pin, roles and panel are
  // all gone. The FR-032 property it also guarded — a denied holder-list read must
  // not degrade the OTHER family's list — is still covered by the
  // `holdersUnavailable` tests above, which is why those were not touched.

  // corr-client-web-7: a legacy holder-list-read privilege (no manage
  // privilege at all) still offers the 14 target roles — read-only.
  describe('read-only target-role view (corr-client-web-7)', () => {
    test('a legacy PlatformAdmin-equivalent holder with no manage privilege gets all 14 roles read-only', () => {
      mockMyPrivileges = [AuthorizationPrivilege.Read, AuthorizationPrivilege.Grant];
      render(<CrdAdminGlobalRolesPage />);
      const nav = screen.getByRole('navigation');
      expect(within(nav).getAllByRole('button')).toHaveLength(14);
      expect(screen.getByText('roleMembers.readOnlyNotice')).toBeInTheDocument();
      expect(screen.queryByText('roleMembers.noAssignablePrivilege')).toBeNull();
      // Current holder still renders …
      expect(screen.getByText('Alice (alice@x.io)')).toBeInTheDocument();
      // … but no manage affordance does.
      expect(screen.queryByRole('button', { name: 'roleMembers.remove' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'roleMembers.add' })).toBeNull();
      expect(screen.queryByText('roleMembers.addMembers')).toBeNull();
    });

    test('a PLATFORM_ROLE_HOLDERS_READ-only holder (e.g. a license manager) gets a read-only view too', () => {
      mockMyPrivileges = [
        AuthorizationPrivilege.PlatformRoleHoldersRead,
        AuthorizationPrivilege.FeatureRoleHoldersRead,
      ];
      render(<CrdAdminGlobalRolesPage />);
      expect(within(screen.getByRole('navigation')).getAllByRole('button')).toHaveLength(14);
      expect(screen.getByText('roleMembers.readOnlyNotice')).toBeInTheDocument();
      // No legacy READ + GRANT — no legacy panel for this operator.
      expect(screen.queryByText('roleMembers.legacyRolesHeading')).toBeNull();
    });

    test('a holder of PLATFORM_ROLES_ASSIGN never sees the read-only notice (manage mode, unchanged)', () => {
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.queryByText('roleMembers.readOnlyNotice')).toBeNull();
      expect(screen.getByRole('button', { name: 'roleMembers.add' })).toBeInTheDocument();
    });
  });

  // 027-platform-role-redesign (T013, Slice B): the "independent holder-list
  // requests" suite is deleted — both its tests asserted a legacy request that no
  // longer exists (a denied legacy read must not degrade the target list, and
  // vice-versa).
  //
  // The FR-032 property they guarded still matters and is NOT dropped: the server
  // fails a holder-list read closed AS A WHOLE (T051a), so the page must keep
  // issuing the privilege read and the holder read as separate calls even now that
  // only one role family remains. That is pinned by the hook mock above, which
  // branches on `relevantRoles.length === 0` and would break loudly if the two
  // were ever merged, and by the `holdersUnavailable` tests in the suites above.
  // corr-client-web-4: `roleSetId` itself can still be unresolved while
  // `useRoleSetManager`'s own authorization query is skipped for lack of an
  // id and reports `loading: false` regardless.
  describe('roleSetId still resolving (corr-client-web-4)', () => {
    test('shows loading while usePlatformRoleSetQuery is in flight, even though loadingPrivileges reports false', () => {
      mockLoadingRoleSetId = true;
      mockRoleSetData = undefined;
      mockLoadingPrivileges = false;
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByRole('navigation')).toBeNull();
      expect(screen.queryByText('roleMembers.noAssignablePrivilege')).toBeNull();
    });

    test('once resolved, a privileged operator sees the nav, not the loading indicator', () => {
      mockLoadingRoleSetId = false;
      mockRoleSetData = { platform: { roleSet: { id: 'rs1' } } };
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.queryByRole('status')).toBeNull();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
  // #9537 (authz admin guard), re-anchored onto the 027 assigner split: the
  // offer-side filter (FR-012) already withholds every role the operator may
  // not manage, so an absent privilege means NO add/remove control at all —
  // never an enabled control the server then refuses. The `GatedAction` gate
  // on the controls that DO render must honour the disjoint tokens
  // (corr-client-web-8): `GRANT_GLOBAL_ADMINS` for a `Platform …` role,
  // `FEATURE_ROLE_ASSIGN` for a `Feature …` role — never one flat token.
  describe('permission gating (#9537)', () => {
    const addButtons = () => screen.getAllByRole('button', { name: 'roleMembers.add' });
    const removeButtons = () => screen.getAllByRole('button', { name: 'roleMembers.remove' });

    // spec FR-002 / SC-007: plain GRANT is not an assigner privilege here.
    test('an operator without an assigner privilege gets no add/remove control and dispatches no mutation', () => {
      mockMyPrivileges = [AuthorizationPrivilege.Grant];
      render(<CrdAdminGlobalRolesPage />);

      expect(screen.queryByRole('button', { name: 'roleMembers.add' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'roleMembers.remove' })).toBeNull();
      expect(screen.getByText('roleMembers.noAssignablePrivilege')).toBeInTheDocument();
      expect(assignPlatformRoleToUser).not.toHaveBeenCalled();
      expect(removePlatformRoleFromUser).not.toHaveBeenCalled();
    });

    test('leaves both controls interactive for a PLATFORM_ROLES_ASSIGN holder on a Platform role', () => {
      mockMyPrivileges = [AuthorizationPrivilege.PlatformRolesAssign];
      render(<CrdAdminGlobalRolesPage />);

      for (const button of [...addButtons(), ...removeButtons()]) {
        expect(button).not.toHaveAttribute('aria-disabled');
        expect(button).not.toBeDisabled();
      }
    });

    test('leaves both controls interactive for a FEATURE_ROLE_ASSIGN-only holder on a Feature role', () => {
      mockMyPrivileges = [AuthorizationPrivilege.FeatureRoleAssign];
      mockPathname = '/admin/authorization/roles/FEATURE_BETA_TESTER';
      render(<CrdAdminGlobalRolesPage />);

      // Both holder kinds render on a Feature role (SC-009): the user and the
      // organization add columns, plus the organization holder's remove.
      for (const button of [...addButtons(), ...removeButtons()]) {
        expect(button).not.toHaveAttribute('aria-disabled');
        expect(button).not.toBeDisabled();
      }
    });

    // spec Edge Case 3 — a completed query that carried no privilege list fails closed
    test('fails closed when privileges are unavailable: no controls, explicit empty state', () => {
      mockMyPrivileges = undefined;
      render(<CrdAdminGlobalRolesPage />);

      expect(screen.queryByRole('button', { name: 'roleMembers.add' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'roleMembers.remove' })).toBeNull();
      expect(screen.getByText('roleMembers.noAssignablePrivilege')).toBeInTheDocument();
    });
  });
});
