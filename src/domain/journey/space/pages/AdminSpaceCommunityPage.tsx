import React, { FC, useMemo, useRef, useState } from 'react';
import { Button, Icon, IconButton, Tooltip } from '@mui/material';
import DownloadForOfflineOutlinedIcon from '@mui/icons-material/DownloadForOfflineOutlined';
import InnovationLibraryIcon from '../../../../main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import SpaceSettingsLayout from '../../../platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';
import { useSpace } from '../SpaceContext/useSpace';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import CommunityUsers from '../../../community/community/CommunityAdmin/CommunityUsers';
import useRoleSetAdmin from '../../../community/community/CommunityAdmin/useCommunityAdmin';
import CommunityOrganizations from '../../../community/community/CommunityAdmin/CommunityOrganizations';
import CommunityApplications from '../../../community/community/CommunityAdmin/CommunityApplications';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import InvitationOptionsBlock from '../../../community/invitations/InvitationOptionsBlock';
import PageContentBlockCollapsible from '../../../../core/ui/content/PageContentBlockCollapsible';
import { BlockTitle, Caption, Text } from '../../../../core/ui/typography';
import CommunityApplicationForm from '../../../community/community/CommunityApplicationForm/CommunityApplicationForm';
import { Trans, useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import CommunityGuidelinesForm from '../../../community/community/CommunityGuidelines/CommunityGuidelinesForm';
import CommunityVirtualContributors from '../../../community/community/CommunityAdmin/CommunityVirtualContributors';
import CommunityGuidelinesContainer, {
  CommunityGuidelines,
} from '../../../community/community/CommunityGuidelines/CommunityGuidelinesContainer';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import ImportTemplatesDialog from '../../../templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { SpaceLevel, TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import {
  useCreateTemplateMutation,
  useSpaceTemplatesSetIdLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import CreateTemplateDialog from '../../../templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import { toCreateTemplateMutationVariables } from '../../../templates/components/Forms/common/mappings';
import { CommunityGuidelinesTemplateFormSubmittedValues } from '../../../templates/components/Forms/CommunityGuidelinesTemplateForm';

const AdminSpaceCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { spaceId, loading: isLoadingSpace, communityId, roleSetId, profile: spaceProfile } = useSpace();

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
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    getAvailableOrganizations,
    loading,
    inviteExternalUser,
    inviteExistingUser,
  } = useRoleSetAdmin({ roleSetId, spaceId, spaceLevel: SpaceLevel.Space });

  const currentApplicationsUserIds = useMemo(
    () =>
      applications?.filter(application => application.state === 'new').map(application => application.contributor.id) ??
      [],
    [applications]
  );

  const currentInvitationsUserIds = useMemo(
    () =>
      invitations?.filter(invitation => invitation.state === 'invited').map(invitation => invitation.contributor.id) ??
      [],
    [invitations]
  );

  const currentMembersIds = useMemo(() => users.map(user => user.id), [users]);

  const currentCommunityGuidelines = useRef<CommunityGuidelines>();
  const [communityGuidelinesTemplatesDialogOpen, setCommunityGuidelinesTemplatesDialogOpen] = useState(false);

  const [saveAsTemplateDialogOpen, setSaveAsTemplateDialogOpen] = useState(false);

  const { spaceNameId } = useUrlParams();
  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  const [fetchSpaceTemplatesSetId] = useSpaceTemplatesSetIdLazyQuery();
  const [createTemplate] = useCreateTemplateMutation();
  const handleSaveAsTemplate = async (values: CommunityGuidelinesTemplateFormSubmittedValues) => {
    const { data: templatesSetData } = await fetchSpaceTemplatesSetId({ variables: { spaceNameId: spaceId } });
    const templatesSetId = templatesSetData?.space.templatesManager?.templatesSet?.id;
    if (templatesSetId) {
      await createTemplate({
        variables: toCreateTemplateMutationVariables(templatesSetId, TemplateType.CommunityGuidelines, values),
      });
      setSaveAsTemplateDialogOpen(false);
    }
  };

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
              platformInvitations={platformInvitations}
              onInvitationStateChange={onInvitationStateChange}
              onDeleteInvitation={onDeleteInvitation}
              onDeletePlatformInvitation={onDeletePlatformInvitation}
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
          <CommunityApplicationForm roleSetId={roleSetId} />
        </PageContentBlockCollapsible>
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
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => setCommunityGuidelinesTemplatesDialogOpen(true)}
                      startIcon={<InnovationLibraryIcon />}
                    >
                      {t('common.library')}
                    </Button>
                    <Tooltip title={<Caption>{t('buttons.saveAsTemplate')}</Caption>}>
                      <IconButton
                        aria-label={t('buttons.saveAsTemplate')}
                        onClick={() => {
                          currentCommunityGuidelines.current = communityGuidelines;
                          setSaveAsTemplateDialogOpen(true);
                        }}
                        sx={{ marginLeft: gutters(0.5) }}
                      >
                        <Icon component={DownloadForOfflineOutlinedIcon} color="primary" />
                      </IconButton>
                    </Tooltip>
                  </>
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
        <CreateTemplateDialog
          open={saveAsTemplateDialogOpen}
          onClose={() => setSaveAsTemplateDialogOpen(false)}
          templateType={TemplateType.CommunityGuidelines}
          onSubmit={handleSaveAsTemplate}
          getDefaultValues={() =>
            Promise.resolve({
              type: TemplateType.CommunityGuidelines,
              communityGuidelines: {
                id: '',
                profile: currentCommunityGuidelines.current!,
              },
            })
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
                onRemoveMember={onRemoveVirtualContributor}
                spaceDisplayName={spaceProfile.displayName}
                fetchAvailableVirtualContributors={getAvailableVirtualContributorsInLibrary}
                fetchAvailableVirtualContributorsOnAccount={getAvailableVirtualContributors}
                onAddMember={onAddVirtualContributor}
                inviteExistingUser={inviteExistingUser}
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
