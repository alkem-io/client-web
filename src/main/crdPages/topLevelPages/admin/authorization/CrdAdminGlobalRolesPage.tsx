import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { usePlatformRoleSetQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { type RoleMember, RoleMembersEditor } from '@/crd/components/admin/roles/RoleMembersEditor';
import { Loading } from '@/crd/components/common/Loading';
import { Button } from '@/crd/primitives/button';
import useRoleSetAvailableOrganizationsOnPlatform from '@/domain/access/AvailableContributors/useRoleSetAvailableOrganizationsOnPlatform';
import useRoleSetAvailableUsers from '@/domain/access/AvailableContributors/useRoleSetAvailableUsers';
import useRoleSetManager, {
  getOfferedPlatformRoles,
  isFeaturePlatformRole,
  type RELEVANT_ROLES,
} from '@/domain/access/RoleSetManager/useRoleSetManager';
import { useDebouncedValue } from '@/main/crdPages/utils/useDebouncedValue';

type PlatformRole = (typeof RELEVANT_ROLES.Platform)[number];

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof ApolloError) {
    return error.graphQLErrors[0]?.message ?? error.message;
  }
  return error instanceof Error ? error.message : String(error);
};

/**
 * CRD global-admin Global Authorization (Roles) section. Reuses the MUI-free
 * role-set data hooks verbatim: `usePlatformRoleSetQuery` (role set id),
 * `useRoleSetManager` (current members + assign/remove), and
 * `useRoleSetAvailableUsers` / `useRoleSetAvailableOrganizationsOnPlatform`
 * (searchable available contributors). The active role comes from the URL
 * (`/admin/authorization/roles/:roleName`).
 *
 * FR-012: the offered role set is filtered by the operator's own assignment
 * privilege (`myPrivileges` on the platform role-set) — never a second,
 * client-side copy of any assignment rule. That same filter is what keeps the
 * holder-list read from ever spanning both role sets in one request (FR-032):
 * `myPrivileges` is fetched independently of `relevantRoles` first, and only
 * the resulting offered set is then used to fetch holder lists.
 */
const CrdAdminGlobalRolesPage = () => {
  const { t } = useTranslation('crd-admin');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Debounced search so we don't refetch on every keystroke.
  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebouncedValue(searchInput);
  const [orgSearchInput, setOrgSearchInput] = useState('');
  const orgSearchTerm = useDebouncedValue(orgSearchInput);

  // Client-side filter over the already-loaded current members (no refetch).
  const [memberSearch, setMemberSearch] = useState('');

  const [assignmentError, setAssignmentError] = useState<string | undefined>();

  const { data } = usePlatformRoleSetQuery();
  const roleSetId = data?.platform.roleSet.id;

  // Phase 1: myPrivileges, independent of which roles are offered (FR-032).
  // `loadingPrivileges` distinguishes "still fetching" from "fetched, offers
  // nothing" so the page never renders an indistinguishable blank panel for
  // either case (corr-client-web-3).
  const { myPrivileges, loading: loadingPrivileges } = useRoleSetManager({ roleSetId, relevantRoles: [] });
  const offeredRoles = getOfferedPlatformRoles(myPrivileges);

  const segments = pathname.split('/').filter(Boolean);
  const rolesIdx = segments.indexOf('roles');
  const roleFromUrl = rolesIdx >= 0 && rolesIdx < segments.length - 1 ? segments[rolesIdx + 1] : undefined;
  const selectedRole = offeredRoles.find(role => role === roleFromUrl) ?? offeredRoles[0];

  // Phase 2: holder lists + mutations, scoped to the offered set only.
  const {
    usersByRole,
    organizationsByRole,
    assignPlatformRoleToUser,
    removePlatformRoleFromUser,
    assignPlatformRoleToOrganization,
    removePlatformRoleFromOrganization,
    loading,
    updating,
    holdersUnavailable,
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: offeredRoles,
    contributorTypes: [ActorType.User, ActorType.Organization],
    fetchContributors: true,
  });

  const currentUsers = (selectedRole && usersByRole?.[selectedRole]) ?? [];
  const members: RoleMember[] = currentUsers.map(user => ({
    id: user.id,
    displayName: user.profile?.displayName ?? '',
    email: user.email ?? undefined,
  }));

  const memberFilter = memberSearch.trim().toLowerCase();
  const filteredMembers = memberFilter
    ? members.filter(
        member =>
          member.displayName.toLowerCase().includes(memberFilter) ||
          (member.email?.toLowerCase().includes(memberFilter) ?? false)
      )
    : members;

  const {
    users: availableUsers = [],
    fetchMore,
    hasMore,
    loading: loadingAvailable,
  } = useRoleSetAvailableUsers({
    roleSetId,
    skip: !roleSetId,
    mode: 'platform',
    filter: searchTerm,
    usersAlreadyInRole: currentUsers,
  });

  const available: RoleMember[] = availableUsers.map(user => ({
    id: user.id,
    displayName: user.profile?.displayName ?? '',
    email: user.email ?? undefined,
  }));

  // SC-009 / FR-002: an organization may hold only a `Feature …` role.
  const showOrganizationSection = Boolean(selectedRole && isFeaturePlatformRole(selectedRole));
  const currentOrganizations = (selectedRole && organizationsByRole?.[selectedRole]) ?? [];
  const organizationMembers: RoleMember[] = currentOrganizations.map(organization => ({
    id: organization.id,
    displayName: organization.profile?.displayName ?? '',
  }));

  const {
    organizations: availableOrganizations = [],
    fetchMore: fetchMoreOrganizations,
    hasMore: hasMoreOrganizations,
    loading: loadingAvailableOrganizations,
  } = useRoleSetAvailableOrganizationsOnPlatform({
    skip: !roleSetId || !showOrganizationSection,
    filter: orgSearchTerm,
    organizationsAlreadyInRole: currentOrganizations,
  });

  const availableOrganizationMembers: RoleMember[] = availableOrganizations.map(organization => ({
    id: organization.id,
    displayName: organization.profile?.displayName ?? '',
  }));

  const roleLabels: Record<PlatformRole, string> = {
    [RoleName.PlatformRolesAdmin]: t('roles.PLATFORM_ROLES_ADMIN'),
    [RoleName.PlatformContentFullAccess]: t('roles.PLATFORM_CONTENT_FULL_ACCESS'),
    [RoleName.PlatformResourceAdmin]: t('roles.PLATFORM_RESOURCE_ADMIN'),
    [RoleName.PlatformSettingsAdmin]: t('roles.PLATFORM_SETTINGS_ADMIN'),
    [RoleName.PlatformOperationsAdmin]: t('roles.PLATFORM_OPERATIONS_ADMIN'),
    [RoleName.PlatformUsersAdmin]: t('roles.PLATFORM_USERS_ADMIN'),
    [RoleName.PlatformSupport]: t('roles.PLATFORM_SUPPORT'),
    [RoleName.PlatformLicenseManager]: t('roles.PLATFORM_LICENSE_MANAGER'),
    [RoleName.PlatformSpacesReader]: t('roles.PLATFORM_SPACES_READER'),
    [RoleName.PlatformAuditReader]: t('roles.PLATFORM_AUDIT_READER'),
    [RoleName.FeatureBetaTester]: t('roles.FEATURE_BETA_TESTER'),
    [RoleName.FeatureVirtualAssistant]: t('roles.FEATURE_VIRTUAL_ASSISTANT'),
    [RoleName.FeatureOrganizationCreator]: t('roles.FEATURE_ORGANIZATION_CREATOR'),
  };

  const roleDescriptions: Record<PlatformRole, string> = {
    [RoleName.PlatformRolesAdmin]: t('roleDescriptions.PLATFORM_ROLES_ADMIN'),
    [RoleName.PlatformContentFullAccess]: t('roleDescriptions.PLATFORM_CONTENT_FULL_ACCESS'),
    [RoleName.PlatformResourceAdmin]: t('roleDescriptions.PLATFORM_RESOURCE_ADMIN'),
    [RoleName.PlatformSettingsAdmin]: t('roleDescriptions.PLATFORM_SETTINGS_ADMIN'),
    [RoleName.PlatformOperationsAdmin]: t('roleDescriptions.PLATFORM_OPERATIONS_ADMIN'),
    [RoleName.PlatformUsersAdmin]: t('roleDescriptions.PLATFORM_USERS_ADMIN'),
    [RoleName.PlatformSupport]: t('roleDescriptions.PLATFORM_SUPPORT'),
    [RoleName.PlatformLicenseManager]: t('roleDescriptions.PLATFORM_LICENSE_MANAGER'),
    [RoleName.PlatformSpacesReader]: t('roleDescriptions.PLATFORM_SPACES_READER'),
    [RoleName.PlatformAuditReader]: t('roleDescriptions.PLATFORM_AUDIT_READER'),
    [RoleName.FeatureBetaTester]: t('roleDescriptions.FEATURE_BETA_TESTER'),
    [RoleName.FeatureVirtualAssistant]: t('roleDescriptions.FEATURE_VIRTUAL_ASSISTANT'),
    [RoleName.FeatureOrganizationCreator]: t('roleDescriptions.FEATURE_ORGANIZATION_CREATOR'),
  };

  const selectRole = (role: PlatformRole) => {
    setAssignmentError(undefined);
    navigate(`/admin/authorization/roles/${role}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {loadingPrivileges ? (
        // corr-client-web-3: the first paint (offeredRoles starts empty until
        // myPrivileges resolves) must not look identical to "no privilege".
        <Loading />
      ) : offeredRoles.length === 0 ? (
        // corr-client-web-3: an operator holding neither GRANT_GLOBAL_ADMINS nor
        // FEATURE_ROLE_ASSIGN gets an explicit, translated empty state instead
        // of a blank panel indistinguishable from a broken page.
        <p className="text-body text-muted-foreground">{t('roleMembers.noAssignablePrivilege')}</p>
      ) : (
        <>
          <nav aria-label={t('roleMembers.roleLabel')} className="flex flex-wrap gap-2">
            {offeredRoles.map(role => (
              <Button
                key={role}
                type="button"
                variant={role === selectedRole ? 'default' : 'outline'}
                size="sm"
                aria-pressed={role === selectedRole}
                onClick={() => selectRole(role)}
              >
                {roleLabels[role]}
              </Button>
            ))}
          </nav>

          {selectedRole && (
            <RoleMembersEditor
              roleLabel={roleLabels[selectedRole]}
              roleDescription={roleDescriptions[selectedRole]}
              errorMessage={assignmentError}
              members={filteredMembers}
              availableUsers={available}
              memberSearchTerm={memberSearch}
              onMemberSearchTermChange={setMemberSearch}
              searchTerm={searchInput}
              onSearchTermChange={setSearchInput}
              onAdd={async userId => {
                setAssignmentError(undefined);
                try {
                  await assignPlatformRoleToUser(userId, selectedRole);
                } catch (error) {
                  setAssignmentError(extractErrorMessage(error));
                }
              }}
              onRemove={async userId => {
                setAssignmentError(undefined);
                try {
                  await removePlatformRoleFromUser(userId, selectedRole);
                } catch (error) {
                  setAssignmentError(extractErrorMessage(error));
                }
              }}
              loadingMembers={loading}
              loadingAvailable={loadingAvailable}
              updating={updating}
              holdersUnavailable={holdersUnavailable}
              hasMore={hasMore}
              onLoadMore={() => {
                void fetchMore();
              }}
              organizationSection={
                showOrganizationSection
                  ? {
                      members: organizationMembers,
                      availableOrganizations: availableOrganizationMembers,
                      searchTerm: orgSearchInput,
                      onSearchTermChange: setOrgSearchInput,
                      onAdd: async organizationId => {
                        setAssignmentError(undefined);
                        try {
                          await assignPlatformRoleToOrganization(organizationId, selectedRole);
                        } catch (error) {
                          setAssignmentError(extractErrorMessage(error));
                        }
                      },
                      onRemove: async organizationId => {
                        setAssignmentError(undefined);
                        try {
                          await removePlatformRoleFromOrganization(organizationId, selectedRole);
                        } catch (error) {
                          setAssignmentError(extractErrorMessage(error));
                        }
                      },
                      loadingMembers: loading,
                      loadingAvailable: loadingAvailableOrganizations,
                      hasMore: hasMoreOrganizations,
                      onLoadMore: () => {
                        void fetchMoreOrganizations();
                      },
                    }
                  : undefined
              }
            />
          )}
        </>
      )}
    </div>
  );
};

export default CrdAdminGlobalRolesPage;
