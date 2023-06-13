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
    onRemoveUser,
    onRemoveOrganization,
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
            onRemoveMember={onRemoveUser}
            loading={loading}
          />
        </PageContentBlock>
      </PageContentColumn>
      <PageContentColumn columns={6}>
        <PageContentBlock>
          <CommunityOrganizations
            organizations={organizations}
            onOrganizationLeadChange={onOrganizationLeadChange}
            onRemoveMember={onRemoveOrganization}
            loading={loading}
          />
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default HubCommunityView;
