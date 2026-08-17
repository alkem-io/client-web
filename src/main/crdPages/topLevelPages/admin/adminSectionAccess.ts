import { AuthorizationPrivilege, RoleName } from '@/core/apollo/generated/graphql-schema';
import { ADMIN_SECTIONS, type AdminSectionDescriptor, type AdminSectionId } from './adminSections';

/**
 * Which admin sections each of the thirteen global roles can actually USE.
 *
 * 027-platform-role-redesign decomposed `global-admin` into thirteen
 * single-purpose roles. The admin console's nine sections were built for the
 * one role that could use all nine, so "who sees what" had no answer — and the
 * two places that guessed at one (the area guard in `NonPlatformAdminRedirect`
 * and the nav filter in `useVisibleAdminSections`) guessed DIFFERENTLY, which
 * is how a role ends up admitted to a shell with no usable section, or granted
 * a nav entry the route guard then redirects it away from.
 *
 * This file is the single answer both of them read.
 *
 * ---------------------------------------------------------------------------
 * DERIVED FROM THE SERVER'S OWN READ GATES, NOT FROM WHAT A ROLE IS "ABOUT".
 * ---------------------------------------------------------------------------
 *
 * A section is listed for a role only when the role can load that section's
 * OWN list query. Anything else produces a nav entry leading to a page that
 * renders an authorization error — strictly worse than not offering it. The
 * gates, read off `platform.admin.resolver.fields.ts` (`grantAnyOrFail`) and
 * `lookup.resolver.fields.ts`:
 *
 *   platformAdmin.spaces / organizations / innovationPacks / innovationHubs /
 *   virtualContributors / accounts  -> PLATFORM_ADMIN | PLATFORM_CONTENT_FULL_ACCESS
 *   platformAdmin.users / identity  -> PLATFORM_ADMIN | PLATFORM_USERS_ADMIN
 *   lookup.authorizationPolicy      -> PLATFORM_ADMIN            (only)
 *   lookup.authorizationPrivilegesForUser -> PLATFORM_ADMIN      (only)
 *   platform.roleSet holder lists   -> PLATFORM_ROLE_HOLDERS_READ |
 *                                      FEATURE_ROLE_HOLDERS_READ | READ
 *   /admin/transfer                 -> account- and space-anchored, see below
 *
 * The empty entries below are therefore NOT oversights; each is a recorded
 * gap, and every one of them is a SERVER-side gap that no client change can
 * close. Widening a client guard past what the API authorizes only moves the
 * failure from the nav to the page body.
 */

/** The thirteen roles this feature introduces. Deliberately a closed union: a
 * `Record` over it forces every future role to be answered here rather than
 * silently defaulting to "sees nothing" (or, worse, "sees everything"). */
export type PlatformRoleNames =
  | RoleName.PlatformRolesAdmin
  | RoleName.PlatformContentFullAccess
  | RoleName.PlatformResourceAdmin
  | RoleName.PlatformSettingsAdmin
  | RoleName.PlatformOperationsAdmin
  | RoleName.PlatformUsersAdmin
  | RoleName.PlatformSupport
  | RoleName.PlatformLicenseManager
  | RoleName.PlatformSpacesReader
  | RoleName.PlatformAuditReader
  | RoleName.FeatureBetaTester
  | RoleName.FeatureVirtualAssistant
  | RoleName.FeatureOrganizationCreator;

export const ROLE_ADMIN_SECTIONS: Record<PlatformRoleNames, readonly AdminSectionId[]> = {
  // Assigns all thirteen roles and reads every holder list — the sole re-grant
  // path FR-012 depends on. Holds no content, no settings, no user records, so
  // this is the one section and deliberately so.
  [RoleName.PlatformRolesAdmin]: ['authorization'],

  // The six `platformAdmin` resource lists all admit PLATFORM_CONTENT_FULL_ACCESS
  // (widened server-side closing finding F6). `organizations` belongs here for
  // the reason the role guide records as the design's one named, accepted
  // exception: this role reaches `deleteOrganization` through the ordinary
  // owner branch. `virtual-contributors` is a read-only list, which this role
  // reads everywhere by definition.
  [RoleName.PlatformContentFullAccess]: [
    'spaces',
    'organizations',
    'innovation-packs',
    'innovation-hubs',
    'virtual-contributors',
  ],

  // Finding F1: this role reports NO privilege on either platform-level policy
  // — `TRANSFER_RESOURCE_*` is anchored on account policies and
  // `MOVE_CONTRIBUTION` on space policies. It is admitted by role name, which
  // is why the role matrix (not the privilege map) has to be the primary input.
  [RoleName.PlatformResourceAdmin]: ['transfer'],

  // The account lifecycle + the PII needed to service it. `authorization`
  // because it assigns the three `Feature …` roles and reads their holder
  // lists (FEATURE_ROLE_ASSIGN / FEATURE_ROLE_HOLDERS_READ); the page already
  // filters the offered roles down to that half by itself.
  [RoleName.PlatformUsersAdmin]: ['users', 'authorization'],

  // Reads every holder list (PLATFORM_ROLE_HOLDERS_READ) and nothing else.
  // `CrdAdminGlobalRolesPage` already renders exactly this case: no manage
  // privilege collapses it to `getViewOnlyPlatformRoles`, i.e. holders visible,
  // no add/remove controls. Consistent with the role's whole purpose — it
  // performs no administrative action, it reviews the ones others performed.
  [RoleName.PlatformAuditReader]: ['authorization'],

  // GAP (server). Its three sections — organizations, packs, hubs — are gated
  // on PLATFORM_CONTENT_FULL_ACCESS, and Support's owning privilege
  // (PLATFORM_SUPPORT_ORG_RESOURCES) is anchored on the org/pack/hub policies,
  // so the platform policy has nothing to check. Its only platform-level
  // privileges are CREATE_ORGANIZATION and PLATFORM_FORUM_MANAGE, and gating
  // the lists on CREATE_ORGANIZATION would also admit Feature Organization
  // Creator and beta-tester, which is wrong. Closing this needs a platform-level
  // anchor for A7 or a per-entity read on the server — recorded as the
  // still-open half of finding F6, deliberately NOT papered over here.
  [RoleName.PlatformSupport]: [],

  // GAP (product). Platform settings, integrations, notification config and
  // license-plan DEFINITION have no CRD admin section at all — there is nothing
  // to show, not merely nothing it may see.
  [RoleName.PlatformSettingsAdmin]: [],

  // GAP (server). It owns `authorizationPolicyResetAll`, but the client never
  // exposed that mutation; the `authorization-policies` section is a read-only
  // INSPECTOR whose two queries (`lookup.authorizationPolicy`,
  // `lookup.authorizationPrivilegesForUser`) are still gated on the legacy
  // PLATFORM_ADMIN catch-all, held by no new role. Offering the section would
  // guarantee two failed queries on first paint.
  [RoleName.PlatformOperationsAdmin]: [],

  // GAP (server), same shape as F1. Its surfaces — space visibility, and the
  // license-plan dialogs on the spaces/users/organizations lists — sit inside
  // sections whose LIST query it cannot load, so it would land on an empty
  // table with a dialog it can never open. Its own privileges
  // (ACCOUNT_LICENSE_MANAGE @account, GRANT @licensing-framework) are invisible
  // at platform level.
  [RoleName.PlatformLicenseManager]: [],

  // Not for humans — a grant to a non-service account is refused outright
  // (rule `spaces-reader-service-account`). Integrations do not use a browser.
  [RoleName.PlatformSpacesReader]: [],

  // Capability roles, not administrative ones. They gate feature exposure and
  // organization creation in the ordinary product UI; none of them administers
  // the platform, so none belongs in the admin shell.
  [RoleName.FeatureBetaTester]: [],
  [RoleName.FeatureVirtualAssistant]: [],
  [RoleName.FeatureOrganizationCreator]: [],
};

/** `ROLE_ADMIN_SECTIONS` inverted. Derived, never hand-maintained — the two
 * directions cannot disagree if only one of them is written. */
export const SECTION_ADMITTING_ROLES: Partial<Record<AdminSectionId, RoleName[]>> = Object.entries(
  ROLE_ADMIN_SECTIONS
).reduce<Partial<Record<AdminSectionId, RoleName[]>>>((acc, [role, sections]) => {
  for (const section of sections) {
    (acc[section] ??= []).push(role as RoleName);
  }
  return acc;
}, {});

/**
 * The same admissions expressed as privileges, unioned with (never instead of)
 * the role matrix above.
 *
 * Two reasons this exists alongside the roles. First, legacy: a `global-admin`
 * / `global-support` / `global-license-manager` holder reaches these sections
 * through PLATFORM_ADMIN and holds none of the thirteen role names — Slice A is
 * additive and nobody who can use a section today may lose sight of it. Second,
 * subsumption: a privilege granted to a role by some future rule admits its
 * holder here without this file needing to know the rule exists.
 *
 * Every entry is a privilege the server ACTUALLY checks for that section's list
 * query, and one the platform-level query actually returns. Privileges that are
 * anchored elsewhere (PLATFORM_SUPPORT_ORG_RESOURCES @account/@organization,
 * TRANSFER_RESOURCE_* @account, ACCOUNT_LICENSE_MANAGE @account) are NOT listed:
 * a mapping that can never fire reads as coverage while providing none, which is
 * exactly what hid finding F1 for as long as it did.
 */
export const SECTION_ADMITTING_PRIVILEGES: Partial<Record<AdminSectionId, AuthorizationPrivilege[]>> = {
  // `platformAdmin.{spaces,organizations,innovationPacks,innovationHubs,virtualContributors}`.
  spaces: [AuthorizationPrivilege.PlatformContentFullAccess],
  organizations: [AuthorizationPrivilege.PlatformContentFullAccess],
  'innovation-packs': [AuthorizationPrivilege.PlatformContentFullAccess],
  'innovation-hubs': [AuthorizationPrivilege.PlatformContentFullAccess],
  'virtual-contributors': [AuthorizationPrivilege.PlatformContentFullAccess],
  // `platformAdmin.users` + `platformAdmin.identity`.
  users: [AuthorizationPrivilege.PlatformUsersAdmin],
  // Assigners AND the two holder-list readers — the Audit Reader's view-only
  // path through this page is a read privilege, not an assignment one.
  authorization: [
    AuthorizationPrivilege.GrantGlobalAdmins,
    AuthorizationPrivilege.FeatureRoleAssign,
    AuthorizationPrivilege.PlatformRoleHoldersRead,
    AuthorizationPrivilege.FeatureRoleHoldersRead,
  ],
  // Kept so a future platform-anchored transfer grant admits without an edit
  // here; today only the role name in `ROLE_ADMIN_SECTIONS` can fire (F1).
  transfer: [AuthorizationPrivilege.TransferResourceOffer, AuthorizationPrivilege.TransferResourceAccept],
  // `authorization-policies` is deliberately absent: both its queries require
  // the legacy PLATFORM_ADMIN, which short-circuits below anyway. It previously
  // mapped to AUTHORIZATION_RESET — a privilege Platform Operations Admin
  // really does hold at platform level, so that mapping FIRED and would have
  // handed the role a section whose every query the server refuses.
};

/**
 * Resolve the sections a viewer may see.
 *
 * NOT a permission check. The server remains the only authority; this hides
 * affordances the viewer cannot use. Deep links still resolve — a hidden
 * section typed into the URL renders and its queries fail server-side, exactly
 * as before. Predicting the server's answer is what FR-012 forbids.
 */
export const resolveVisibleAdminSections = ({
  privileges,
  roles,
}: {
  privileges: readonly AuthorizationPrivilege[] | undefined;
  roles: readonly RoleName[] | undefined;
}): readonly AdminSectionDescriptor[] => {
  const held = new Set(privileges ?? []);

  // The legacy catch-all keeps seeing everything. Slice A is strictly additive.
  if (held.has(AuthorizationPrivilege.PlatformAdmin)) {
    return ADMIN_SECTIONS;
  }

  const heldRoles = new Set(roles ?? []);

  return ADMIN_SECTIONS.filter(section => {
    const admittingPrivileges = SECTION_ADMITTING_PRIVILEGES[section.id];
    const admittingRoles = SECTION_ADMITTING_ROLES[section.id];
    // An unmapped section is HIDDEN, not shown. The previous default was the
    // reverse ("a section added later must not silently disappear"), which was
    // right while nine sections were reachable only by one all-powerful role
    // and wrong the moment narrow roles arrived: it made every new section
    // visible to every admitted role by default, and it is what put
    // `authorization-policies` in front of roles that cannot load it. A section
    // with no entry now has to be answered in `ROLE_ADMIN_SECTIONS`.
    return (
      (admittingPrivileges?.some(privilege => held.has(privilege)) ?? false) ||
      (admittingRoles?.some(role => heldRoles.has(role)) ?? false)
    );
  });
};

/**
 * May this viewer enter the admin area at all?
 *
 * Defined as "has at least one usable section", rather than as its own list of
 * admitting privileges. Two independently-maintained lists is precisely the
 * drift this feature kept paying for: a role admitted at the route with no
 * visible section lands in an empty shell, and a role given a section it cannot
 * reach gets redirected to /restricted from its own nav entry.
 */
export const canUseAdminArea = (input: {
  privileges: readonly AuthorizationPrivilege[] | undefined;
  roles: readonly RoleName[] | undefined;
}): boolean => resolveVisibleAdminSections(input).length > 0;
