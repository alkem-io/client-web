import { FC } from 'react';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import CommunityOrganizations from '../../../community/community/CommunityAdmin/CommunityOrganizations';
import CommunityUsers from '../../../community/community/CommunityAdmin/CommunityUsers';
import useCommunityAdmin from '../../../community/community/CommunityAdmin/useCommunityAdmin';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';
import { useOpportunity } from '../hooks/useOpportunity';
import SubspaceSettingsLayout from '../../../platform/admin/subspace/SubspaceSettingsLayout';
import CommunityVirtualContributors from '../../../community/community/CommunityAdmin/CommunityVirtualContributors';
import { useSpace } from '../../space/SpaceContext/useSpace';

const AdminOpportunityCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { loading: isLoadingChallenge, communityId, opportunityId } = useOpportunity();

  const { spaceId } = useSpace();

  const {
    users,
    organizations,
    virtualContributors,
    communityPolicy,
    permissions,
    onUserLeadChange,
    onUserAuthorizationChange,
    onOrganizationLeadChange,
    onAddUser,
    onAddOrganization,
    inviteExistingUser,
    onRemoveUser,
    onRemoveOrganization,
    onRemoveVirtualContributor,
    getAvailableUsers,
    getAvailableOrganizations,
    getAvailableVirtualContributors,
    loading,
  } = useCommunityAdmin({ spaceId, opportunityId, communityId, journeyLevel: 2 });

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
              communityPolicy={communityPolicy}
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
              communityPolicy={communityPolicy}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
        {permissions.virtualContributorsEnabled && (
          <PageContentColumn columns={6}>
            <PageContentBlock>
              <CommunityVirtualContributors
                virtualContributors={virtualContributors}
                canAddVirtualContributors={
                  permissions.canAddVirtualContributorsFromAccount || permissions.canAddMembers
                }
                inviteExistingUser={inviteExistingUser}
                onRemoveMember={onRemoveVirtualContributor}
                fetchAvailableVirtualContributors={getAvailableVirtualContributors}
                fetchAvailableVirtualContributorsOnAccount={getAvailableVirtualContributors}
                loading={loading}
              />
            </PageContentBlock>
          </PageContentColumn>
        )}
      </PageContent>
    </SubspaceSettingsLayout>
  );
};

export default AdminOpportunityCommunityPage;
