import { useMemo, useRef, useState } from 'react';
import { Button, Icon, IconButton, Tooltip } from '@mui/material';
import DownloadForOfflineOutlinedIcon from '@mui/icons-material/DownloadForOfflineOutlined';
import InnovationLibraryIcon from '@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import CommunityUsers from '@/domain/space/admin/SpaceAdminCommunity/components/CommunityUsers';
import CommunityOrganizations from '@/domain/space/admin/SpaceAdminCommunity/components/CommunityOrganizations';
import CommunityMemberships from '@/domain/space/admin/SpaceAdminCommunity/components/CommunityMemberships';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import InvitationOptionsBlock from '@/domain/community/invitations/InvitationOptionsBlock';
import PageContentBlockCollapsible from '@/core/ui/content/PageContentBlockCollapsible';
import { BlockTitle, Caption, Text } from '@/core/ui/typography';
import CommunityApplicationForm from '@/domain/community/community/CommunityApplicationForm/CommunityApplicationForm';
import { Trans, useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import CommunityGuidelinesForm from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesForm';
import CommunityVirtualContributors from '@/domain/space/admin/SpaceAdminCommunity/components/CommunityVirtualContributors';
import CommunityGuidelinesContainer, {
  CommunityGuidelines,
} from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesContainer';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { SpaceLevel, TemplateType } from '@/core/apollo/generated/graphql-schema';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { useCreateTemplateMutation, useSpaceTemplatesManagerLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import CreateTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import { toCreateTemplateMutationVariables } from '@/domain/templates/components/Forms/common/mappings';
import { CommunityGuidelinesTemplateFormSubmittedValues } from '@/domain/templates/components/Forms/CommunityGuidelinesTemplateForm';
import { SpaceAboutLightModel } from '../../about/model/spaceAboutLight.model';
import useCommunityAdmin from './hooks/useCommunityAdmin';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';

export type AdminSpaceCommunityPageProps = SettingsPageProps & {
  about: SpaceAboutLightModel;
  roleSetId: string;
  level: SpaceLevel;
  spaceId: string;
  communityGuidelinesId: string;
  pendingMembershipsEnabled: boolean;
  communityGuidelinesEnabled: boolean;
  communityGuidelinesTemplatesEnabled: boolean;
  addVirtualContributorsEnabled: boolean;
  useL0Layout: boolean;
  loading: boolean;
};

const AdminSpaceCommunityPage = ({
  about,
  roleSetId,
  level,
  spaceId,
  pendingMembershipsEnabled,
  communityGuidelinesId,
  communityGuidelinesEnabled,
  communityGuidelinesTemplatesEnabled,
  addVirtualContributorsEnabled,
  useL0Layout,
  loading: isLoadingSpace,
  routePrefix = '../',
}: AdminSpaceCommunityPageProps) => {
  const { t } = useTranslation();

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
      onApplicationStateChange,
      onInvitationStateChange,
      onDeleteInvitation,
      onDeletePlatformInvitation,
    },
    permissions,
    loading,
  } = useCommunityAdmin({ level, roleSetId });

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

  const [fetchSpaceTemplatesManager] = useSpaceTemplatesManagerLazyQuery();

  const [createTemplate] = useCreateTemplateMutation();

  const handleSaveAsTemplate = async (values: CommunityGuidelinesTemplateFormSubmittedValues) => {
    const { data: templatesSetData } = await fetchSpaceTemplatesManager({ variables: { spaceId } });
    const templatesSetId = templatesSetData?.lookup.space?.templatesManager?.templatesSet?.id;
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
    <LayoutSwitcher currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix} useL0Layout={useL0Layout}>
      <PageContent background="transparent">
        {pendingMembershipsEnabled && (
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
                currentInvitationsUserIds={currentInvitationsUserIds}
                currentMembersIds={currentMembersIds}
                parentSpaceId={undefined}
              />
            </PageContentBlockSeamless>
          </PageContentColumn>
        )}
        <PageContentBlockCollapsible header={<BlockTitle>{t('community.application-form.title')}</BlockTitle>}>
          <Text marginBottom={gutters(2)}>
            <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
          </Text>
          <CommunityApplicationForm roleSetId={roleSetId} />
        </PageContentBlockCollapsible>

        {communityGuidelinesEnabled && (
          <CommunityGuidelinesContainer communityGuidelinesId={communityGuidelinesId}>
            {({
              communityGuidelines,
              profileId,
              loading,
              onSelectCommunityGuidelinesTemplate,
              onUpdateCommunityGuidelines,
              onDeleteCommunityGuidelinesContent: onDeleteCommunityGuidelines,
            }) => {
              return (
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
                      profileId={profileId}
                      onSubmit={onUpdateCommunityGuidelines}
                      onDeleteCommunityGuidelines={onDeleteCommunityGuidelines}
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

        {communityGuidelinesTemplatesEnabled && (
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
                canAddVirtualContributors={addVirtualContributorsEnabled}
                onRemoveMember={onRemoveVirtualContributor}
                spaceDisplayName={about.profile.displayName}
                fetchAvailableVirtualContributors={getAvailableVirtualContributorsInLibrary}
                fetchAvailableVirtualContributorsOnAccount={getAvailableVirtualContributors}
                onAddMember={onAddVirtualContributor}
                inviteExistingUser={inviteExistingUser}
                loading={loading}
              />
            </PageContentBlock>
          </PageContentColumn>
        }
      </PageContent>
    </LayoutSwitcher>
  );
};

export default AdminSpaceCommunityPage;
