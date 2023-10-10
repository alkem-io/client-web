import React, { FC, useMemo } from 'react';
import SpaceSettingsLayout from '../../../platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';
import { useSpace } from '../SpaceContext/useSpace';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import CommunityUsers from '../../../community/community/CommunityAdmin/CommunityUsers';
import useCommunityAdmin from '../../../community/community/CommunityAdmin/useCommunityAdmin';
import CommunityOrganizations from '../../../community/community/CommunityAdmin/CommunityOrganizations';
import CommunityApplications from '../../../community/community/CommunityAdmin/CommunityApplications';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import InvitationOptionsBlock from '../../../community/invitations/InvitationOptionsBlock';

const AdminSpaceCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId, loading: isLoadingSpace, communityId, profile: spaceProfile } = useSpace();

  const {
    users,
    organizations,
    applications,
    invitations,
    invitationsExternal,
    communityPolicy,
    permissions,
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
  } = useCommunityAdmin({ communityId, spaceId });

  const currentApplicationsUserIds = useMemo(
    () =>
      applications
        ?.filter(application => application.lifecycle.state === 'new')
        .map(application => application.user.id) ?? [],
    [applications]
  );

  const currentInvitationsUserIds = useMemo(
    () =>
      invitations
        ?.filter(invitation => invitation.lifecycle.state === 'invited')
        .map(invitation => invitation.user.id) ?? [],
    [invitations]
  );

  const currentMembersIds = useMemo(() => users.map(user => user.id), [users]);

  if (!spaceId || isLoadingSpace) {
    return null;
  }

  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <PageContent background="transparent">
        <PageContentColumn columns={12}>
          <PageContentBlock columns={8}>
            <CommunityApplications
              applications={applications}
              onApplicationStateChange={onApplicationStateChange}
              canHandleInvitations
              invitations={invitations}
              invitationsExternal={invitationsExternal}
              onInvitationStateChange={onInvitationStateChange}
              onDeleteInvitation={onDeleteInvitation}
              onDeleteInvitationExternal={onDeleteInvitationExternal}
              loading={loading}
            />
          </PageContentBlock>
          <PageContentBlockSeamless columns={4} disablePadding>
            <InvitationOptionsBlock
              spaceDisplayName={spaceProfile.displayName}
              inviteExistingUser={inviteExistingUser}
              inviteExternalUser={inviteExternalUser}
              currentApplicationsUserIds={currentApplicationsUserIds}
              currentInvitationsUserIds={currentInvitationsUserIds}
              currentMembersIds={currentMembersIds}
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
    </SpaceSettingsLayout>
  );
};

export default AdminSpaceCommunityPage;
