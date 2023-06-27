import { FC } from 'react';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import CommunityUsers from '../../../../community/community/CommunityAdmin/CommunityUsers';
import useSpaceCommunityContext from './useSpaceCommunityContext';
import CommunityOrganizations from '../../../../community/community/CommunityAdmin/CommunityOrganizations';
import CommunityApplications from '../../../../community/community/CommunityAdmin/CommunityApplications';

interface SpaceCommunityViewProps {
  spaceId: string;
}

export const SpaceCommunityView: FC<SpaceCommunityViewProps> = ({ spaceId }) => {
  const {
    users,
    organizations,
    applications,
    communityPolicy,
    permissions,
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
  } = useSpaceCommunityContext(spaceId);

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
  );
};

export default SpaceCommunityView;
