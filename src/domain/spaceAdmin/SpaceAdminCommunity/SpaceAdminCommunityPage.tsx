import { useCallback, useRef, useState } from 'react';
import { Button, Icon, IconButton, Tooltip } from '@mui/material';
import DownloadForOfflineOutlinedIcon from '@mui/icons-material/DownloadForOfflineOutlined';
import InnovationLibraryIcon from '@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import type { SettingsPageProps } from '@/domain/platformAdmin/layout/EntitySettingsLayout/types';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import CommunityUsers from '@/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityUsers';
import CommunityOrganizations from '@/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityOrganizations';
import CommunityMemberships from '@/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityMemberships';
import PageContentBlockCollapsible from '@/core/ui/content/PageContentBlockCollapsible';
import { BlockTitle, Caption, Text } from '@/core/ui/typography';
import CommunityApplicationForm from '@/domain/community/community/CommunityApplicationForm/CommunityApplicationForm';
import { Trans, useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import CommunityGuidelinesForm from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesForm';
import CommunityVirtualContributors from '@/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityVirtualContributors';
import CommunityGuidelinesContainer, {
  CommunityGuidelines,
} from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesContainer';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import {
  LicenseEntitlementType,
  RoleSetContributorType,
  SpaceLevel,
  TemplateType,
} from '@/core/apollo/generated/graphql-schema';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useCreateTemplateMutation, useSpaceTemplatesManagerLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import CreateTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import { toCreateTemplateMutationVariables } from '@/domain/templates/components/Forms/common/mappings';
import { TemplateCommunityGuidelinesFormSubmittedValues } from '@/domain/templates/components/Forms/TemplateCommunityGuidelinesForm';
import { SpaceAboutLightModel } from '../../space/about/model/spaceAboutLight.model';
import useCommunityAdmin from './hooks/useCommunityAdmin';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';
import useVirtualContributorsAdmin from './hooks/useVirtualContributorsAdmin';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import InviteContributorsWizard from '@/domain/community/inviteContributors/InviteContributorsWizard';
import { Identifiable } from '@/core/utils/Identifiable';

export type SpaceAdminCommunityPageProps = SettingsPageProps & {
  about: SpaceAboutLightModel;
  roleSetId: string;
  level: SpaceLevel;
  spaceId: string;
  communityGuidelinesId: string;
  pendingMembershipsEnabled: boolean;
  communityGuidelinesEnabled: boolean;
  communityGuidelinesTemplatesEnabled: boolean;
  virtualContributorsBlockEnabled: boolean;
  spaceEntitlements: LicenseEntitlementType[];
  useL0Layout: boolean;
  loading: boolean;
};

const SpaceAdminCommunityPage = ({
  about,
  roleSetId,
  level,
  spaceId,
  pendingMembershipsEnabled,
  communityGuidelinesId,
  communityGuidelinesEnabled,
  communityGuidelinesTemplatesEnabled,
  virtualContributorsBlockEnabled,
  spaceEntitlements,
  useL0Layout,
  loading: isLoadingSpace,
  routePrefix = '../',
}: SpaceAdminCommunityPageProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState(false);

  const {
    userAdmin: {
      members: users,
      onLeadChange: onUserLeadChange,
      onAuthorizationChange: onUserAuthorizationChange,
      onAdd: onAddUser,
      onRemove: onRemoveUser,
      getAvailable: getAvailableUsers,
      inviteContributors: inviteUsers,
    },
    organizationAdmin: {
      members: organizations,
      onLeadChange: onOrganizationLeadChange,
      onAdd: onAddOrganization,
      onRemove: onRemoveOrganization,
      getAvailable: getAvailableOrganizations,
    },
    virtualContributorAdmin: { members: virtualContributors, onAdd: onAddVC, onRemove: onRemoveVirtualContributor },
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
  } = useCommunityAdmin({ roleSetId });

  // People that can be invited to the community
  const filterInviteeContributors = useCallback(
    (contributor: Identifiable) => !(users ?? []).some(user => user.id === contributor.id),
    [users]
  );

  // instead of making the VC filtering logic more complex, we just show all VCs under the account
  // and show an error message if the user is not allowed to add the VC
  const onAddVirtualContributor = async (vcId: string) => {
    try {
      await onAddVC(vcId);
    } catch (_error) {
      setError(true);

      return;
    }
  };

  const {
    virtualContributorAdmin: {
      getAvailable: getAvailableVirtualContributors,
      getAvailableInLibrary: getAvailableVirtualContributorsInLibrary,
    },
  } = useVirtualContributorsAdmin({ level, currentMembers: virtualContributors, spaceId });

  const spaceVirtualContributorEntitlementEnabled = spaceEntitlements.includes(
    LicenseEntitlementType.SpaceFlagVirtualContributorAccess
  );
  const addVirtualContributorsEnabled =
    spaceVirtualContributorEntitlementEnabled &&
    (permissions.canAddVirtualContributorsFromAccount || permissions.canAddVirtualContributors);

  const currentCommunityGuidelines = useRef<CommunityGuidelines | undefined>(undefined);
  const [communityGuidelinesTemplatesDialogOpen, setCommunityGuidelinesTemplatesDialogOpen] = useState(false);

  const [saveAsTemplateDialogOpen, setSaveAsTemplateDialogOpen] = useState(false);

  const [fetchSpaceTemplatesManager] = useSpaceTemplatesManagerLazyQuery();

  const [createTemplate] = useCreateTemplateMutation();

  const handleSaveAsTemplate = async (values: TemplateCommunityGuidelinesFormSubmittedValues) => {
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
          <PageContentBlock>
            <PageContentBlockHeader title={t('community.pendingMemberships')}>
              <InviteContributorsWizard
                contributorType={RoleSetContributorType.User}
                filterContributors={filterInviteeContributors}
                onlyFromParentCommunity={level === SpaceLevel.L2}
              >
                {t('buttons.invite')}
              </InviteContributorsWizard>
              <Tooltip title={t('community.applicationsHelp')} arrow>
                <IconButton aria-label={t('common.help')} sx={{ marginLeft: gutters() }}>
                  <HelpOutlineIcon sx={{ color: theme => theme.palette.common.black }} />
                </IconButton>
              </Tooltip>
            </PageContentBlockHeader>
            <CommunityMemberships
              applications={applications}
              onApplicationStateChange={onApplicationStateChange}
              invitations={invitations}
              platformInvitations={platformInvitations}
              onInvitationStateChange={onInvitationStateChange}
              onDeleteInvitation={onDeleteInvitation}
              onDeletePlatformInvitation={onDeletePlatformInvitation}
              loading={loading}
            />
          </PageContentBlock>
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
                    onSelectTemplate={async (template: Identifiable) => {
                      await onSelectCommunityGuidelinesTemplate(template);
                      setCommunityGuidelinesTemplatesDialogOpen(false);
                    }}
                    enablePlatformTemplates
                    actionButton={() => (
                      <Button startIcon={<SystemUpdateAltIcon />} variant="contained">
                        {t('buttons.use')}
                      </Button>
                    )}
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
              canAddUsers={permissions.canAddUsers}
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
              canAddOrganizations={permissions.canAddOrganizations}
              onAddMember={onAddOrganization}
              onRemoveMember={onRemoveOrganization}
              fetchAvailableOrganizations={getAvailableOrganizations}
              memberRoleDefinition={memberRoleDefinition}
              leadRoleDefinition={leadRoleDefinition}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
        {virtualContributorsBlockEnabled && (
          <PageContentColumn columns={6}>
            <PageContentBlock>
              <CommunityVirtualContributors
                virtualContributors={virtualContributors}
                canAddVirtualContributors={addVirtualContributorsEnabled}
                onRemoveMember={onRemoveVirtualContributor}
                spaceDisplayName={about.profile.displayName}
                fetchAvailableVirtualContributorsInLibrary={getAvailableVirtualContributorsInLibrary}
                fetchAvailableVirtualContributors={getAvailableVirtualContributors}
                onAddMember={onAddVirtualContributor}
                inviteContributors={inviteUsers}
                loading={loading}
              />
            </PageContentBlock>
          </PageContentColumn>
        )}
        <ConfirmationDialog
          actions={{
            onCancel: () => setError(false),
          }}
          options={{
            show: Boolean(error),
          }}
          entities={{
            title: t('community.unableToAddMemberInfo.title'),
            content: t('community.unableToAddMemberInfo.content'),
            cancelButtonText: t('buttons.ok'),
            confirmButtonText: '',
          }}
        />
      </PageContent>
    </LayoutSwitcher>
  );
};

export default SpaceAdminCommunityPage;
