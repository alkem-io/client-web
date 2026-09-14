import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { usePlatformRoleSetQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { type RoleMember, RoleMembersEditor } from '@/crd/components/admin/roles/RoleMembersEditor';
import { Button } from '@/crd/primitives/button';
import useRoleSetAvailableUsers from '@/domain/access/AvailableContributors/useRoleSetAvailableUsers';
import useActionPermission from '@/domain/access/permissions/useActionPermission';
import useRoleSetManager, { RELEVANT_ROLES } from '@/domain/access/RoleSetManager/useRoleSetManager';
import { PLATFORM_ROLE_ASSIGN_PRIVILEGES } from '@/main/crdPages/permissions/roleAssignmentPrivileges';
import usePermissionReasonText from '@/main/crdPages/permissions/usePermissionReasonText';
import { useDebouncedValue } from '@/main/crdPages/utils/useDebouncedValue';

const PLATFORM_ROLES = RELEVANT_ROLES.Platform;

type PlatformRole = (typeof PLATFORM_ROLES)[number];

/**
 * CRD global-admin Global Authorization (Roles) section. Reuses the MUI-free
 * role-set data hooks verbatim: `usePlatformRoleSetQuery` (role set id),
 * `useRoleSetManager` (current members + assign/remove), and
 * `useRoleSetAvailableUsers` (searchable available users). The active role
 * comes from the URL (`/admin/authorization/roles/:roleName`).
 */
const CrdAdminGlobalRolesPage = () => {
  const { t } = useTranslation('crd-admin');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Debounced search so we don't refetch on every keystroke.
  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebouncedValue(searchInput);

  // Client-side filter over the already-loaded current members (no refetch).
  const [memberSearch, setMemberSearch] = useState('');

  const segments = pathname.split('/').filter(Boolean);
  const rolesIdx = segments.indexOf('roles');
  const roleFromUrl = rolesIdx >= 0 && rolesIdx < segments.length - 1 ? segments[rolesIdx + 1] : undefined;
  const selectedRole = PLATFORM_ROLES.find(role => role === roleFromUrl) ?? PLATFORM_ROLES[0];

  const { data } = usePlatformRoleSetQuery();
  const roleSetId = data?.platform.roleSet.id;

  const { usersByRole, assignPlatformRoleToUser, removePlatformRoleFromUser, loading, updating, myPrivileges } =
    useRoleSetManager({
      roleSetId,
      relevantRoles: PLATFORM_ROLES,
      contributorTypes: [ActorType.User],
      fetchContributors: true,
    });

  // Gate the add/remove controls on the privilege the backend enforces, so the action is
  // prevented rather than silently refused. Defaults to gated while privileges load.
  const reasonText = usePermissionReasonText();
  const assignPermission = useActionPermission(myPrivileges, PLATFORM_ROLE_ASSIGN_PRIVILEGES, loading);
  const assignDisabledReason = reasonText(assignPermission);

  const currentUsers = usersByRole?.[selectedRole] ?? [];
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

  const roleLabels: Record<PlatformRole, string> = {
    [RoleName.GlobalAdmin]: t('roles.GLOBAL_ADMIN'),
    [RoleName.GlobalSupport]: t('roles.GLOBAL_SUPPORT'),
    [RoleName.GlobalLicenseManager]: t('roles.GLOBAL_LICENSE_MANAGER'),
    [RoleName.GlobalCommunityReader]: t('roles.GLOBAL_COMMUNITY_READER'),
    [RoleName.GlobalSpacesReader]: t('roles.GLOBAL_SPACES_READER'),
    [RoleName.GlobalPlatformManager]: t('roles.GLOBAL_PLATFORM_MANAGER'),
    [RoleName.GlobalSupportManager]: t('roles.GLOBAL_SUPPORT_MANAGER'),
    [RoleName.PlatformOperationsAdmin]: t('roles.PLATFORM_OPERATIONS_ADMIN'),
    [RoleName.PlatformBetaTester]: t('roles.PLATFORM_BETA_TESTER'),
    [RoleName.PlatformVcCampaign]: t('roles.PLATFORM_VC_CAMPAIGN'),
    [RoleName.PlatformAssistantAccess]: t('roles.PLATFORM_ASSISTANT_ACCESS'),
  };

  const roleDescriptions: Record<PlatformRole, string> = {
    [RoleName.GlobalAdmin]: t('roleDescriptions.GLOBAL_ADMIN'),
    [RoleName.GlobalSupport]: t('roleDescriptions.GLOBAL_SUPPORT'),
    [RoleName.GlobalLicenseManager]: t('roleDescriptions.GLOBAL_LICENSE_MANAGER'),
    [RoleName.GlobalCommunityReader]: t('roleDescriptions.GLOBAL_COMMUNITY_READER'),
    [RoleName.GlobalSpacesReader]: t('roleDescriptions.GLOBAL_SPACES_READER'),
    [RoleName.GlobalPlatformManager]: t('roleDescriptions.GLOBAL_PLATFORM_MANAGER'),
    [RoleName.GlobalSupportManager]: t('roleDescriptions.GLOBAL_SUPPORT_MANAGER'),
    [RoleName.PlatformOperationsAdmin]: t('roleDescriptions.PLATFORM_OPERATIONS_ADMIN'),
    [RoleName.PlatformBetaTester]: t('roleDescriptions.PLATFORM_BETA_TESTER'),
    [RoleName.PlatformVcCampaign]: t('roleDescriptions.PLATFORM_VC_CAMPAIGN'),
    [RoleName.PlatformAssistantAccess]: t('roleDescriptions.PLATFORM_ASSISTANT_ACCESS'),
  };

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label={t('roleMembers.roleLabel')} className="flex flex-wrap gap-2">
        {PLATFORM_ROLES.map(role => (
          <Button
            key={role}
            type="button"
            variant={role === selectedRole ? 'default' : 'outline'}
            size="sm"
            aria-pressed={role === selectedRole}
            onClick={() => navigate(`/admin/authorization/roles/${role}`)}
          >
            {roleLabels[role]}
          </Button>
        ))}
      </nav>

      <RoleMembersEditor
        roleLabel={roleLabels[selectedRole]}
        roleDescription={roleDescriptions[selectedRole]}
        members={filteredMembers}
        availableUsers={available}
        memberSearchTerm={memberSearch}
        onMemberSearchTermChange={setMemberSearch}
        searchTerm={searchInput}
        onSearchTermChange={setSearchInput}
        onAdd={userId => {
          void assignPlatformRoleToUser(userId, selectedRole);
        }}
        onRemove={userId => {
          void removePlatformRoleFromUser(userId, selectedRole);
        }}
        addDisabledReason={assignDisabledReason}
        removeDisabledReason={assignDisabledReason}
        loadingMembers={loading}
        loadingAvailable={loadingAvailable}
        updating={updating}
        hasMore={hasMore}
        onLoadMore={() => {
          void fetchMore();
        }}
      />
    </div>
  );
};

export default CrdAdminGlobalRolesPage;
