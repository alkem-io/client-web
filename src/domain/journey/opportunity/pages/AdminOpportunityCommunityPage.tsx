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
import OpportunitySettingsLayout from '../../../platform/admin/opportunity/OpportunitySettingsLayout';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CommunityVirtualContributors from '../../../community/community/CommunityAdmin/CommunityVirtualContributors';

const AdminOpportunityCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { loading: isLoadingChallenge, communityId, opportunityId } = useOpportunity();

  const { spaceNameId } = useUrlParams();

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
    onAddVirtualContributor,
    onRemoveUser,
    onRemoveOrganization,
    onRemoveVirtualContributor,
    getAvailableUsers,
    getAvailableOrganizations,
    getAvailableVirtualContributors,
    loading,
  } = useCommunityAdmin({ spaceId: spaceNameId, opportunityId, communityId });

  if (!spaceNameId || isLoadingChallenge) {
    return null;
  }

  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
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
                canAddVirtualContributors={permissions.canAddVirtualContributors}
                onAddMember={onAddVirtualContributor}
                onRemoveMember={onRemoveVirtualContributor}
                fetchAvailableVirtualContributors={getAvailableVirtualContributors}
                loading={loading}
              />
            </PageContentBlock>
          </PageContentColumn>
        )}
      </PageContent>
    </OpportunitySettingsLayout>
  );
};

export default AdminOpportunityCommunityPage;
