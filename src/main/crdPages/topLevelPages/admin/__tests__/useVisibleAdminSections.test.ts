import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ROLE_ADMIN_SECTIONS } from '../adminSectionAccess';
import { useVisibleAdminSections } from '../useVisibleAdminSections';

/**
 * Found live 2026-08-05: a real `platform-roles-admin` holder reached the admin
 * area (correctly) and was shown all nine sections, eight of which they cannot
 * operate — and was landed on `spaces` by the fixed index redirect.
 *
 * The privileges below mirror what a running server actually reports, verified
 * against the stored credential rules and re-measured per role in
 * `live-assertion-run.md` (§Observed privilege contract): the assignment
 * privileges are on the platform ROLE SET, not on the platform entity.
 */
const usePlatformLevelAuthorizationQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformLevelAuthorizationQuery: () => usePlatformLevelAuthorizationQueryMock(),
}));

const arrange = ({
  platform = [],
  roleSet = [],
  myRoles = [],
}: {
  platform?: string[];
  roleSet?: string[];
  myRoles?: string[];
}) => {
  usePlatformLevelAuthorizationQueryMock.mockReturnValue({
    data: {
      platform: {
        authorization: { myPrivileges: platform },
        roleSet: { myRoles, authorization: { myPrivileges: roleSet } },
      },
    },
    loading: false,
  });
  return renderHook(() => useVisibleAdminSections()).result.current.sections.map(s => s.id);
};

describe('useVisibleAdminSections', () => {
  test('the legacy global admin keeps seeing every section (Slice A is additive)', () => {
    const visible = arrange({ platform: ['PLATFORM_ADMIN'] });

    expect(visible).toHaveLength(9);
    expect(visible).toContain('spaces');
    expect(visible).toContain('transfer');
  });

  test('a user with no admin privileges sees no sections', () => {
    expect(arrange({})).toEqual([]);
  });

  test('reports loading so the index redirect does not land on a stale default', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue({ data: undefined, loading: true });

    expect(renderHook(() => useVisibleAdminSections()).result.current.loading).toBe(true);
  });

  /**
   * One case per role, and the privilege fixtures are copied verbatim from the
   * live run's observed contract — NOT from `privilege.grants.ts`, which is
   * right about the two policies but silent about which roles report nothing at
   * platform level. A fixture that invents a privilege the server never returns
   * tests a server that does not exist, which is how finding F1 survived.
   */
  describe('per role', () => {
    test('Platform Roles Admin — assignment only', () => {
      expect(
        arrange({
          platform: ['SET_SERVICE_PROFILE'],
          roleSet: ['GRANT_GLOBAL_ADMINS', 'FEATURE_ROLE_ASSIGN', 'PLATFORM_ROLE_HOLDERS_READ'],
          myRoles: ['PLATFORM_ROLES_ADMIN'],
        })
      ).toEqual(['authorization']);
    });

    test('Platform Users Admin — the user records it owns, plus the Feature half of role assignment', () => {
      expect(
        arrange({
          platform: ['PLATFORM_USERS_ADMIN'],
          roleSet: ['FEATURE_ROLE_ASSIGN', 'FEATURE_ROLE_HOLDERS_READ'],
          myRoles: ['PLATFORM_USERS_ADMIN'],
        }).sort()
      ).toEqual(['authorization', 'users']);
    });

    // The five `platformAdmin` resource lists that admit PLATFORM_CONTENT_FULL_ACCESS
    // server-side. `organizations` is the design's one named, accepted exception
    // (this role reaches deleteOrganization through the owner branch); before
    // this it was mapped to PLATFORM_SUPPORT_ORG_RESOURCES only, so the role
    // that CAN load the list was the one role not offered it.
    test('Platform Content Full Access — every resource list the server lets it load', () => {
      expect(
        arrange({
          platform: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'PLATFORM_CONTENT_FULL_ACCESS'],
          roleSet: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'PLATFORM_CONTENT_FULL_ACCESS'],
          myRoles: ['PLATFORM_CONTENT_FULL_ACCESS'],
        }).sort()
      ).toEqual(['innovation-hubs', 'innovation-packs', 'organizations', 'spaces', 'virtual-contributors']);
    });

    // Finding F1: verified live, this role reports an EMPTY myPrivileges on BOTH
    // platform policies — TRANSFER_RESOURCE_* is anchored on account policies.
    // The fixture carries no privileges at all because that is what the running
    // server returns; the role name is the only signal available.
    test('Platform Resource Admin — transfer, by role, with no privileges at all (F1)', () => {
      expect(arrange({ myRoles: ['PLATFORM_RESOURCE_ADMIN'] })).toEqual(['transfer']);
    });

    // Read-only oversight. `CrdAdminGlobalRolesPage` already collapses to
    // `getViewOnlyPlatformRoles` when no manage privilege is present, so this
    // lands on holders-visible / no-add-remove rather than on dead buttons.
    test('Platform Audit Reader — the holder lists, view-only', () => {
      expect(
        arrange({
          platform: ['PLATFORM_AUDIT_READ'],
          roleSet: ['PLATFORM_ROLE_HOLDERS_READ'],
          myRoles: ['PLATFORM_AUDIT_READER'],
        })
      ).toEqual(['authorization']);
    });

    /**
     * The roles with NO usable section. Each is a recorded SERVER-side gap, and
     * every one of these fixtures is the role's real observed privilege set —
     * so if a server change later opens one of these lists, this test fails and
     * points at the role whose matrix entry is now stale. That is the intent:
     * an empty entry must be revisited, not preserved.
     *
     * Support's three lists are gated on PLATFORM_CONTENT_FULL_ACCESS while its
     * own privilege is anchored on the org/pack/hub policies (still-open half of
     * F6). Operations Admin's inspector queries still require the legacy
     * PLATFORM_ADMIN. License Manager and Beta Tester report nothing at platform
     * level at all (F1). Settings Admin has no section to see.
     */
    test.each([
      [
        'Platform Support',
        {
          platform: ['CREATE_ORGANIZATION', 'PLATFORM_FORUM_MANAGE'],
          roleSet: ['PLATFORM_FORUM_MANAGE'],
          myRoles: ['PLATFORM_SUPPORT'],
        },
      ],
      ['Platform Settings Admin', { platform: ['PLATFORM_SETTINGS_ADMIN'], myRoles: ['PLATFORM_SETTINGS_ADMIN'] }],
      [
        'Platform Operations Admin',
        { platform: ['AUTHORIZATION_RESET', 'PLATFORM_OPERATIONS_ADMIN'], myRoles: ['PLATFORM_OPERATIONS_ADMIN'] },
      ],
      ['Platform License Manager', { myRoles: ['PLATFORM_LICENSE_MANAGER'] }],
      ['Platform Spaces Reader', { myRoles: ['PLATFORM_SPACES_READER'] }],
      ['Feature Beta Tester', { myRoles: ['FEATURE_BETA_TESTER'] }],
      ['Feature Virtual Assistant', { platform: ['ACCESS_VIRTUAL_ASSISTANT'], myRoles: ['FEATURE_VIRTUAL_ASSISTANT'] }],
      [
        'Feature Organization Creator',
        { platform: ['CREATE_ORGANIZATION'], myRoles: ['FEATURE_ORGANIZATION_CREATOR'] },
      ],
    ])('%s sees no section (recorded gap)', (_role, fixture) => {
      expect(arrange(fixture)).toEqual([]);
    });
  });

  // The former default was "an unmapped section stays visible". With one
  // all-powerful role that was harmless; with narrow roles it made every future
  // section visible to every admitted role, and it is what put the
  // authorization-policies inspector — whose queries still require the legacy
  // PLATFORM_ADMIN — in front of roles that cannot load it.
  test('a section nobody is mapped to is hidden, not shown by default', () => {
    expect(arrange({ platform: ['PLATFORM_USERS_ADMIN'], roleSet: ['FEATURE_ROLE_ASSIGN'] })).not.toContain(
      'authorization-policies'
    );
  });

  test('the assignment privileges are read from the ROLE SET, not the platform', () => {
    // The exact defect class that hid the nav entry: reading only the platform
    // policy makes every one of the thirteen roles look unprivileged.
    expect(arrange({ platform: ['GRANT_GLOBAL_ADMINS'], roleSet: [] })).toEqual(['authorization']);
    expect(arrange({ platform: [], roleSet: ['GRANT_GLOBAL_ADMINS'] })).toEqual(['authorization']);
  });

  // The privilege path must survive the role path existing: a legacy holder
  // whose transfer reach comes from an account-anchored grant still sees it.
  test('the transfer privilege mapping still admits without the role', () => {
    expect(arrange({ platform: ['TRANSFER_RESOURCE_ACCEPT'] })).toEqual(['transfer']);
  });

  test('every one of the thirteen roles has an answer, empty or not', () => {
    expect(Object.keys(ROLE_ADMIN_SECTIONS)).toHaveLength(13);
  });
});
