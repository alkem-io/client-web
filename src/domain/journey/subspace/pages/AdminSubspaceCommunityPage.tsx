import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import CommunityApplications from '@/domain/community/community/CommunityAdmin/CommunityApplications';
import CommunityOrganizations from '@/domain/community/community/CommunityAdmin/CommunityOrganizations';
import CommunityUsers from '@/domain/community/community/CommunityAdmin/CommunityUsers';
import useRoleSetAdmin from '@/domain/community/community/CommunityAdmin/useCommunityAdmin';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import { useSubSpace } from '../hooks/useSubSpace';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import InnovationLibraryIcon from '@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import CommunityVirtualContributors from '@/domain/community/community/CommunityAdmin/CommunityVirtualContributors';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import InvitationOptionsBlock from '@/domain/community/invitations/InvitationOptionsBlock';
import PageContentBlockCollapsible from '@/core/ui/content/PageContentBlockCollapsible';
import { BlockTitle } from '@/core/ui/typography';
import CommunityGuidelinesContainer from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesContainer';
import CommunityGuidelinesForm from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesForm';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';

const AdminSubspaceCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { t } = useTranslation();
  const {
    loading: isLoadingChallenge,
    communityId,
    roleSetId,
    subspaceId: challengeId,
    subspaceNameId,
  } = useSubSpace();
  const { loading: isLoadingSpace } = useSpace();

  const [communityGuidelinesTemplatesDialogOpen, setCommunityGuidelinesTemplatesDialogOpen] = useState(false);

  const { spaceId, spaceLevel } = useRouteResolver();

  const {
    users,
    organizations,
    virtualContributors,
    applications,
    invitations,
    platformInvitations,
    memberRoleDefinition,
    leadRoleDefinition,
    permissions,
    entitlements,
    onApplicationStateChange,
    onInvitationStateChange,
    onDeleteInvitation,
    onDeletePlatformInvitation,
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
    getAvailableVirtualContributorsInLibrary,
    loading,
    inviteExternalUser,
    inviteExistingUser,
  } = useRoleSetAdmin({ roleSetId, spaceId, challengeId, spaceLevel });

  const currentApplicationsUserIds = useMemo(
    () =>
      applications?.filter(application => application.state === 'new').map(application => application.contributor.id) ??
      [],
    [applications]
  );

  const currentInvitationsContributorIds = useMemo(
    () =>
      invitations?.filter(invitation => invitation.state === 'invited').map(invitation => invitation.contributor.id) ??
      [],
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
              platformInvitations={platformInvitations}
              onInvitationStateChange={onInvitationStateChange}
              onDeleteInvitation={onDeleteInvitation}
              onDeletePlatformInvitation={onDeletePlatformInvitation}
              loading={loading}
            />
          </PageContentBlock>
          <PageContentBlockSeamless columns={4} disablePadding>
            <InvitationOptionsBlock
              spaceDisplayName={subspaceNameId}
              inviteExistingUser={inviteExistingUser}
              inviteExternalUser={inviteExternalUser}
              currentApplicationsUserIds={currentApplicationsUserIds}
              currentInvitationsUserIds={currentInvitationsContributorIds}
              currentMembersIds={currentMembersIds}
              spaceId={spaceId}
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
                  <Button
                    variant="outlined"
                    onClick={() => setCommunityGuidelinesTemplatesDialogOpen(true)}
                    startIcon={<InnovationLibraryIcon />}
                  >
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
              <ImportTemplatesDialog
                open={communityGuidelinesTemplatesDialogOpen}
                templateType={TemplateType.CommunityGuidelines}
                onClose={() => setCommunityGuidelinesTemplatesDialogOpen(false)}
                onSelectTemplate={onSelectCommunityGuidelinesTemplate}
                enablePlatformTemplates
                actionButton={
                  <LoadingButton startIcon={<SystemUpdateAltIcon />} variant="contained">
                    {t('buttons.use')}
                  </LoadingButton>
                }
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
              memberRoleDefinition={memberRoleDefinition}
              leadRoleDefinition={leadRoleDefinition}
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
              memberRoleDefinition={memberRoleDefinition}
              leadRoleDefinition={leadRoleDefinition}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
        {entitlements.virtualContributorsEnabled && (
          <PageContentColumn columns={6}>
            <PageContentBlock>
              <CommunityVirtualContributors
                virtualContributors={virtualContributors}
                canAddVirtualContributors={
                  permissions.canAddVirtualContributorsFromAccount || permissions.canAddMembers
                }
                inviteExistingUser={inviteExistingUser}
                onRemoveMember={onRemoveVirtualContributor}
                fetchAvailableVirtualContributors={getAvailableVirtualContributorsInLibrary}
                fetchAvailableVirtualContributorsOnAccount={getAvailableVirtualContributors}
                onAddMember={onAddVirtualContributor}
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
