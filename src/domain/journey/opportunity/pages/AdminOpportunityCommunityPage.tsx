import { FC } from 'react';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import CommunityApplications from '../../../community/community/CommunityAdmin/CommunityApplications';
import CommunityOrganizations from '../../../community/community/CommunityAdmin/CommunityOrganizations';
import CommunityUsers from '../../../community/community/CommunityAdmin/CommunityUsers';
import useCommunityAdmin from '../../../community/community/CommunityAdmin/useCommunityAdmin';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';
import { useOpportunity } from '../hooks/useOpportunity';
import OpportunitySettingsLayout from '../../../platform/admin/opportunity/OpportunitySettingsLayout';

const AdminOpportunityCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId, loading: isLoadingChallenge, communityId } = useOpportunity();

  const {
    users,
    organizations,
    applications,
    communityPolicy,
    permissions,
    onApplicationStateChange,
    onUserLeadChange,
    onOrganizationLeadChange,
    onAddUser,
    onAddOrganization,
    onRemoveUser,
    onRemoveOrganization,
    getAvailableUsers,
    getAvailableOrganizations,
    loading,
  } = useCommunityAdmin(communityId, false);

  if (!spaceId || isLoadingChallenge) {
    return null;
  }

  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <PageContent background="transparent">
        <PageContentColumn columns={12}>
          <PageContentBlock columns={12}>
            <CommunityApplications
              applications={applications}
              onApplicationStateChange={onApplicationStateChange}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={6}>
          <PageContentBlock>
            <CommunityUsers
              users={users}
              onUserLeadChange={onUserLeadChange}
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
      </PageContent>
    </OpportunitySettingsLayout>
  );
};

export default AdminOpportunityCommunityPage;
