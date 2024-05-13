import React, { FC, useCallback, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import InnovationLibraryIcon from '../../../../main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
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
import { useInnovationPacksLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import CommunityApplicationForm from '../../../community/community/CommunityApplicationForm/CommunityApplicationForm';
import { Trans, useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import CommunityGuidelines from '../../../community/community/CommunityGuidelines/CommunityGuidelines';
import CommunityVirtualContributors from '../../../community/community/CommunityAdmin/CommunityVirtualContributors';
import ImportTemplatesDialog from '../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialog';
import { TemplateType } from '../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import CommunityGuidelinesImportTemplateCard from '../../../platform/admin/templates/CommunityGuidelines/CommunityGuidelinesImportTemplateCard';

const AdminSpaceCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { spaceId, loading: isLoadingSpace, communityId, profile: spaceProfile } = useSpace();

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

  // TODO: get community guidelines data
  const [loadInnovationPacks, { data: innovationPacks, loading: loadingInnovationPacks }] =
  useInnovationPacksLazyQuery();

  const [isImportTemplatesDialogOpen, setImportTemplatesDialogOpen] = useState(false);
  const openImportTemplateDialog = useCallback(() => {
    loadInnovationPacks();
    setImportTemplatesDialogOpen(true);
  }, []);
  const closeImportTemplatesDialog = useCallback(() => setImportTemplatesDialogOpen(false), []);

  const handleImportTemplate = async () => {};

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
        <PageContentBlockCollapsible header={<BlockTitle>{t('community.application-form.title')}</BlockTitle>}>
          <Text marginBottom={gutters(2)}>
            <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
          </Text>
          <CommunityApplicationForm communityId={communityId} />
        </PageContentBlockCollapsible>
        <PageContentBlockCollapsible
          header={<BlockTitle>{t('community.communityGuidelines.title')}</BlockTitle>}
          primaryAction={
            <Box marginLeft="auto">
              {/* {canImportTemplates && ( */}
              {true && (
                <Button
                  variant="outlined"
                  onClick={event => {
                    event.stopPropagation();
                    openImportTemplateDialog();
                  }}
                  sx={{ marginRight: theme => theme.spacing(1) }}
                  startIcon={<InnovationLibraryIcon />}
                >
                  {t('common.library')}
                </Button>
              )}
            </Box>
          }
        >
          <CommunityGuidelines communityId={communityId} />
        </PageContentBlockCollapsible>
        <ImportTemplatesDialog
          headerText={t('pages.admin.generic.sections.templates.import.title', {
            templateType: t('community.communityGuidelines.title'),
          })}
          dialogSubtitle={t('pages.admin.generic.sections.templates.import.subtitle')}
          templateImportCardComponent={CommunityGuidelinesImportTemplateCard}
          // getImportedTemplateContent={}
          templateType={TemplateType.CommunityGuidelinesTemplate}
          open={isImportTemplatesDialogOpen}
          onClose={closeImportTemplatesDialog}
          onImportTemplate={handleImportTemplate}
          innovationPacks={[]}
          loading={loadingInnovationPacks}
          actionButton={
            <Button
              startIcon={<SystemUpdateAltIcon />}
              variant="contained"
              sx={{ marginLeft: theme => theme.spacing(1) }}
            >
              {t('buttons.import')}
            </Button>
          }
        />
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
    </SpaceSettingsLayout>
  );
};

export default AdminSpaceCommunityPage;
