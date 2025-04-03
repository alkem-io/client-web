import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import CommunityMemberships from '@/domain/space/admin/SpaceCommunity/CommunityMemberships';
import CommunityOrganizations from '@/domain/space/admin/SpaceCommunity/CommunityOrganizations';
import CommunityUsers from '@/domain/space/admin/SpaceCommunity/CommunityUsers';
import useCommunityAdmin from '@/domain/space/admin/SpaceCommunity/useCommunityAdmin';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import { useSubSpace } from '../../hooks/useSubSpace';
import InnovationLibraryIcon from '@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import CommunityVirtualContributors from '@/domain/space/admin/SpaceCommunity/CommunityVirtualContributors';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import InvitationOptionsBlock from '@/domain/community/invitations/InvitationOptionsBlock';
import PageContentBlockCollapsible from '@/core/ui/content/PageContentBlockCollapsible';
import { BlockTitle } from '@/core/ui/typography';
import CommunityGuidelinesContainer from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesContainer';
import CommunityGuidelinesForm from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesForm';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { SpaceLevel, TemplateType } from '@/core/apollo/generated/graphql-schema';
import SubspaceSettingsLayout from '@/domain/space/admin/layout/SubspaceSettingsLayout';

const AdminSubspaceCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { loading: isLoadingSubspace, subspace, parentSpaceId } = useSubSpace();
  const { id: spaceId, level: spaceLevel, about } = subspace;

  const [communityGuidelinesTemplatesDialogOpen, setCommunityGuidelinesTemplatesDialogOpen] = useState(false);

  const {
    userAdmin: {
      members: users,
      onLeadChange: onUserLeadChange,
      onAuthorizationChange: onUserAuthorizationChange,
      onAdd: onAddUser,
      onRemove: onRemoveUser,
      getAvailable: getAvailableUsers,
      inviteExisting: inviteExistingUser,
      inviteExternal: inviteExternalUser,
    },
    organizationAdmin: {
      members: organizations,
      onLeadChange: onOrganizationLeadChange,
      onAdd: onAddOrganization,
      onRemove: onRemoveOrganization,
      getAvailable: getAvailableOrganizations,
    },
    virtualContributorAdmin: {
      members: virtualContributors,
      onAdd: onAddVirtualContributor,
      onRemove: onRemoveVirtualContributor,
      getAvailable: getAvailableVirtualContributors,
      getAvailableInLibrary: getAvailableVirtualContributorsInLibrary,
    },
    membershipAdmin: {
      applications,
      invitations,
      platformInvitations,
      memberRoleDefinition,
      leadRoleDefinition,
      communityGuidelinesId,
      onApplicationStateChange,
      onInvitationStateChange,
      onDeleteInvitation,
      onDeletePlatformInvitation,
    },
    permissions,
    loading,
  } = useCommunityAdmin({ about, spaceId, spaceLevel });

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

  const areApplicationsInvitationsEnabled = spaceLevel !== SpaceLevel.L2;
  const areCommunityGuidelinesEnabled = spaceLevel !== SpaceLevel.L2;

  if (!spaceId || isLoadingSubspace) {
    return null;
  }

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <PageContent background="transparent">
        {areApplicationsInvitationsEnabled && (
          <PageContentColumn columns={12}>
            <PageContentBlock columns={8}>
              <CommunityMemberships
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
                spaceDisplayName={about.profile.displayName}
                inviteExistingUser={inviteExistingUser}
                inviteExternalUser={inviteExternalUser}
                currentApplicationsUserIds={currentApplicationsUserIds}
                currentInvitationsUserIds={currentInvitationsContributorIds}
                currentMembersIds={currentMembersIds}
                parentSpaceId={parentSpaceId}
                isSubspace
              />
            </PageContentBlockSeamless>
          </PageContentColumn>
        )}
        {areCommunityGuidelinesEnabled && (
          <CommunityGuidelinesContainer communityGuidelinesId={communityGuidelinesId}>
            {({
              communityGuidelines,
              profileId,
              loading,
              onSelectCommunityGuidelinesTemplate,
              onUpdateCommunityGuidelines,
              onDeleteCommunityGuidelinesContent,
            }) => {
              return (
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
                      onDeleteCommunityGuidelines={onDeleteCommunityGuidelinesContent}
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
              );
            }}
          </CommunityGuidelinesContainer>
        )}
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
        {
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
        }
      </PageContent>
    </SubspaceSettingsLayout>
  );
};

export default AdminSubspaceCommunityPage;
