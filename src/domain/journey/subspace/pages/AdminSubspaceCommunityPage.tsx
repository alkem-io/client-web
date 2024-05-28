import { FC, useCallback, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import CommunityApplications from '../../../community/community/CommunityAdmin/CommunityApplications';
import CommunityOrganizations from '../../../community/community/CommunityAdmin/CommunityOrganizations';
import CommunityUsers from '../../../community/community/CommunityAdmin/CommunityUsers';
import useCommunityAdmin from '../../../community/community/CommunityAdmin/useCommunityAdmin';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';
import { useSubSpace } from '../hooks/useChallenge';
import SubspaceSettingsLayout from '../../../platform/admin/subspace/SubspaceSettingsLayout';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import InnovationLibraryIcon from '../../../../main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import CommunityVirtualContributors from '../../../community/community/CommunityAdmin/CommunityVirtualContributors';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import InvitationOptionsBlock from '../../../community/invitations/InvitationOptionsBlock';
import PageContentBlockCollapsible from '../../../../core/ui/content/PageContentBlockCollapsible';
import { BlockTitle } from '../../../../core/ui/typography';
import CommunityGuidelinesContainer from '../../../community/community/CommunityGuidelines/CommunityGuidelinesContainer';
import CommunityGuidelinesForm from '../../../community/community/CommunityGuidelines/CommunityGuidelinesForm';
import CommunityGuidelinesTemplatesLibrary from '../../../collaboration/communityGuidelines/CommunityGuidelinesTemplateLibrary/CommunityGuidelinesTemplatesLibrary';
import { useSpace } from '../../space/SpaceContext/useSpace';

const AdminSubspaceCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { loading: isLoadingChallenge, communityId, subspaceId: challengeId, subspaceNameId } = useSubSpace();
  const { isPrivate, loading: isLoadingSpace } = useSpace();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openTemplateDialog = useCallback(() => setIsDialogOpen(true), []);
  const closeTemplatesDialog = useCallback(() => setIsDialogOpen(false), []);

  const { spaceId, journeyLevel } = useRouteResolver();

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
    getAvailableOrganizations,
    getAvailableVirtualContributors,
    loading,
    inviteExternalUser,
    inviteExistingUser,
  } = useCommunityAdmin({ communityId, spaceId, challengeId, journeyLevel });

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

  if (!spaceId || isLoadingChallenge || isLoadingSpace) {
    return null;
  }

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
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
              spaceDisplayName={subspaceNameId}
              inviteExistingUser={inviteExistingUser}
              inviteExternalUser={inviteExternalUser}
              currentApplicationsUserIds={currentApplicationsUserIds}
              currentInvitationsUserIds={currentInvitationsUserIds}
              currentMembersIds={currentMembersIds}
              spaceId={spaceId}
              isParentPrivate={isPrivate}
              isSubspace
            />
          </PageContentBlockSeamless>
        </PageContentColumn>
        <CommunityGuidelinesContainer communityId={communityId}>
          {({
            communityGuidelines,
            profileId,
            loading,
            onSelectCommunityGuidelinesTemplate,
            onUpdateCommunityGuidelines,
          }) => (
            <>
              <PageContentBlockCollapsible
                header={<BlockTitle>{t('community.communityGuidelines.title')}</BlockTitle>}
                primaryAction={
                  <Button variant="outlined" onClick={() => openTemplateDialog()} startIcon={<InnovationLibraryIcon />}>
                    {t('common.library')}
                  </Button>
                }
              >
                <CommunityGuidelinesForm
                  data={communityGuidelines}
                  loading={loading}
                  onSubmit={onUpdateCommunityGuidelines}
                  profileId={profileId}
                />
              </PageContentBlockCollapsible>
              <CommunityGuidelinesTemplatesLibrary
                open={isDialogOpen}
                onClose={closeTemplatesDialog}
                onSelectTemplate={onSelectCommunityGuidelinesTemplate}
              />
            </>
          )}
        </CommunityGuidelinesContainer>
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
    </SubspaceSettingsLayout>
  );
};

export default AdminSubspaceCommunityPage;
