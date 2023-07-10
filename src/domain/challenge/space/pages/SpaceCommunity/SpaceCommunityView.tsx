import React, { FC } from 'react';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import CommunityUsers from '../../../../community/community/CommunityAdmin/CommunityUsers';
import useSpaceCommunityContext from './useSpaceCommunityContext';
import CommunityOrganizations from '../../../../community/community/CommunityAdmin/CommunityOrganizations';
import CommunityApplications from '../../../../community/community/CommunityAdmin/CommunityApplications';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import InvitationOptionsBlock from '../../../../community/invitations/InvitationOptionsBlock';

interface SpaceCommunityViewProps {
  spaceId: string;
}

export const SpaceCommunityView: FC<SpaceCommunityViewProps> = ({ spaceId }) => {
  const {
    users,
    organizations,
    applications,
    invitations,
    invitationsExternal,
    communityPolicy,
    permissions,
    spaceDisplayName,
    onApplicationStateChange,
    onInvitationStateChange,
    onDeleteInvitation,
    onDeleteInvitationExternal,
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
    inviteExternalUser,
    inviteExistingUser,
  } = useSpaceCommunityContext(spaceId);

  return (
    <PageContent background="transparent">
      <PageContentColumn columns={12}>
        <PageContentBlock columns={8}>
          <CommunityApplications
            applications={applications}
            invitations={invitations}
            invitationsExternal={invitationsExternal}
            onApplicationStateChange={onApplicationStateChange}
            onInvitationStateChange={onInvitationStateChange}
            onDeleteInvitation={onDeleteInvitation}
            onDeleteInvitationExternal={onDeleteInvitationExternal}
            loading={loading}
          />
        </PageContentBlock>
        <PageContentBlockSeamless columns={4} disablePadding>
          <InvitationOptionsBlock
            spaceDisplayName={spaceDisplayName}
            inviteExistingUser={inviteExistingUser}
            inviteExternalUser={inviteExternalUser}
          />
        </PageContentBlockSeamless>
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
