import { FC } from 'react';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import CommunityOrganizations from '@/domain/community/community/CommunityAdmin/CommunityOrganizations';
import CommunityUsers from '@/domain/community/community/CommunityAdmin/CommunityUsers';
import useCommunityAdmin from '@/domain/community/community/CommunityAdmin/useCommunityAdmin';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import CommunityVirtualContributors from '@/domain/community/community/CommunityAdmin/CommunityVirtualContributors';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useSubSpace } from '../../subspace/hooks/useSubSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import SubspaceSettingsLayout from '@/domain/space/routing/toReviewAdmin/SubspaceSettingsLayout';

const AdminOpportunityCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId, parentSpaceId } = useUrlResolver();
  const { loading: isLoadingChallenge, subspace } = useSubSpace();
  const roleSetId = subspace?.about.membership.roleSetID!;

  const {
    users,
    organizations,
    virtualContributors,
    memberRoleDefinition,
    leadRoleDefinition,
    permissions,
    onUserLeadChange,
    onUserAuthorizationChange,
    onOrganizationLeadChange,
    onAddUser,
    onAddOrganization,
    onAddVirtualContributor,
    inviteExistingUser,
    onRemoveUser,
    onRemoveOrganization,
    onRemoveVirtualContributor,
    getAvailableUsers,
    getAvailableOrganizations,
    getAvailableVirtualContributorsInLibrary,
    loading,
  } = useCommunityAdmin({ spaceId, roleSetId, spaceLevel: SpaceLevel.L2 });

  // get the VC filtered on the parent
  const { getAvailableVirtualContributors } = useCommunityAdmin({
    roleSetId,
    spaceId: parentSpaceId,
    spaceLevel: SpaceLevel.L2,
  });

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
