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
import PageContentBlockCollapsible from '../../../../core/ui/content/PageContentBlockCollapsible';
import { BlockTitle, Text } from '../../../../core/ui/typography';
import CommunityApplicationForm from '../../../community/community/CommunityApplicationForm/CommunityApplicationForm';
import { Trans, useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import CommunityGuidelines from '../../../community/community/CommunityGuidelines/CommunityGuidelines';
import CommunityVirtualContributors from '../../../community/community/CommunityAdmin/CommunityVirtualContributors';
import { useUserContext } from '../../../community/user';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';

const AdminSpaceCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { spaceId, loading: isLoadingSpace, communityId, profile: spaceProfile } = useSpace();
  const { user: { hasPlatformPrivilege } = {} } = useUserContext();

  const {
    users,
    organizations,
    virtualContributors,
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
    onAddVirtualContributor,
    onRemoveUser,
    onRemoveOrganization,
    onRemoveVirtualContributor,
    getAvailableUsers,
    getAvailableVirtualContributors,
    getAvailableOrganizations,
    loading,
    inviteExternalUser,
    inviteExistingUser,
  } = useCommunityAdmin({ communityId, spaceId, journeyLevel: 0 });

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
              spaceId={spaceId}
            />
          </PageContentBlockSeamless>
        </PageContentColumn>
        <PageContentBlockCollapsible header={<BlockTitle>{t('community.application-form.title')}</BlockTitle>}>
          <Text marginBottom={gutters(2)}>
            <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
          </Text>
          <CommunityApplicationForm communityId={communityId} />
        </PageContentBlockCollapsible>
        <PageContentBlockCollapsible header={<BlockTitle>{t('community.communityGuidelines.title')}</BlockTitle>}>
          <CommunityGuidelines communityId={communityId} />
        </PageContentBlockCollapsible>
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
                isPlatformAdmin={hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin)}
                fetchAvailableVirtualContributors={getAvailableVirtualContributors}
                loading={loading}
              />
            </PageContentBlock>
          </PageContentColumn>
        )}
      </PageContent>
    </SpaceSettingsLayout>
  );
};

export default AdminSpaceCommunityPage;
