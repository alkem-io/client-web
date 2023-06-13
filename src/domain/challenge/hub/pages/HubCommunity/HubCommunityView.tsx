import { FC } from 'react';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import CommunityUsers from '../../../../community/community/CommunityAdmin/CommunityUsers';
import useHubCommunityContext from './useHubCommunityContext';
import CommunityOrganizations from '../../../../community/community/CommunityAdmin/CommunityOrganizations';
import CommunityApplications from '../../../../community/community/CommunityAdmin/CommunityApplications';

interface HubCommunityViewProps {
  hubId: string;
}

export const HubCommunityView: FC<HubCommunityViewProps> = ({ hubId }) => {
  const {
    users,
    organizations,
    applications,
    onApplicationStateChange,
    onUserLeadChange,
    onUserAuthorizationChange,
    onOrganizationLeadChange,
    onAddUser,
    onAddOrganization,
    onRemoveUser,
    onRemoveOrganization,
    getAvailableUsers,
    getAvailableOrganizations,
    loading,
  } = useHubCommunityContext(hubId);

  return (
    <PageContent background="transparent">
      <PageContentColumn columns={12}>
        <PageContentBlock>
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
            onUserAuthorizationChange={onUserAuthorizationChange}
            onAddMember={onAddUser}
            onRemoveMember={onRemoveUser}
            fetchAvailableUsers={getAvailableUsers}
            loading={loading}
          />
        </PageContentBlock>
      </PageContentColumn>
      <PageContentColumn columns={6}>
        <PageContentBlock>
          <CommunityOrganizations
            organizations={organizations}
            onOrganizationLeadChange={onOrganizationLeadChange}
            onAddMember={onAddOrganization}
            onRemoveMember={onRemoveOrganization}
            fetchAvailableOrganizations={getAvailableOrganizations}
            loading={loading}
          />
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default HubCommunityView;
