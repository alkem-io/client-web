import { FC } from 'react';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import CommunityOrganizations from '@/domain/space/admin/SpaceCommunity/CommunityOrganizations';
import CommunityUsers from '@/domain/space/admin/SpaceCommunity/CommunityUsers';
import useCommunityAdmin from '@/domain/space/admin/SpaceCommunity/useCommunityAdmin';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import CommunityVirtualContributors from '@/domain/space/admin/SpaceCommunity/CommunityVirtualContributors';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useSubSpace } from '../../hooks/useSubSpace';
import SubspaceSettingsLayout from '@/domain/space/admin/layout/SubspaceSettingsLayout';

const AdminOpportunityCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { loading: isLoadingChallenge, subspace } = useSubSpace();
  const { id: spaceId } = subspace;
  const { about } = subspace;

  const {
    userAdmin: {
      members: users,
      onLeadChange: onUserLeadChange,
      onAuthorizationChange: onUserAuthorizationChange,
      onAdd: onAddUser,
      onRemove: onRemoveUser,
      getAvailable: getAvailableUsers,
      inviteExisting: inviteExistingUser,
    },
    organizationAdmin: {
      members: organizations,
      onLeadChange: onOrganizationLeadChange,
      onAdd: onAddOrganization,
      onRemove: onRemoveOrganization,
      getAvailable: getAvailableOrganizations,
    },
    virtualContributorAdmin: {
      members: virtualContributors,
      onAdd: onAddVirtualContributor,
      onRemove: onRemoveVirtualContributor,
      getAvailable: getAvailableVirtualContributors,
      getAvailableInLibrary: getAvailableVirtualContributorsInLibrary,
    },
    membershipAdmin: { memberRoleDefinition, leadRoleDefinition },
    permissions,
    loading,
  } = useCommunityAdmin({ spaceId, about, spaceLevel: SpaceLevel.L2 });

  if (!spaceId || isLoadingChallenge) {
    return null;
  }

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <PageContent background="transparent">
        <PageContentColumn columns={6}>
          <PageContentBlock>
            <CommunityUsers
              users={users}
              onUserLeadChange={onUserLeadChange}
              onUserAuthorizationChange={onUserAuthorizationChange}
              canAddMembers={permissions.canAddMembers}
              onAddMember={onAddUser}
              onRemoveMember={onRemoveUser}
              fetchAvailableUsers={getAvailableUsers}
              memberRoleDefinition={memberRoleDefinition}
              leadRoleDefinition={leadRoleDefinition}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={6}>
          <PageContentBlock>
            <CommunityOrganizations
              organizations={organizations}
              onOrganizationLeadChange={onOrganizationLeadChange}
              canAddMembers={permissions.canAddMembers}
              onAddMember={onAddOrganization}
              onRemoveMember={onRemoveOrganization}
              fetchAvailableOrganizations={getAvailableOrganizations}
              memberRoleDefinition={memberRoleDefinition}
              leadRoleDefinition={leadRoleDefinition}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
        {
          <PageContentColumn columns={6}>
            <PageContentBlock>
              <CommunityVirtualContributors
                virtualContributors={virtualContributors}
                canAddVirtualContributors={
                  permissions.canAddVirtualContributorsFromAccount || permissions.canAddMembers
                }
                inviteExistingUser={inviteExistingUser}
                onRemoveMember={onRemoveVirtualContributor}
                fetchAvailableVirtualContributors={getAvailableVirtualContributorsInLibrary}
                fetchAvailableVirtualContributorsOnAccount={getAvailableVirtualContributors}
                onAddMember={onAddVirtualContributor}
                loading={loading}
              />
            </PageContentBlock>
          </PageContentColumn>
        }
      </PageContent>
    </SubspaceSettingsLayout>
  );
};

export default AdminOpportunityCommunityPage;
