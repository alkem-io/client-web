import {
  useDeleteSpaceMutation,
  useSpacePrivilegesQuery,
  useSpaceSettingsQuery,
  useSpaceTemplatesManagerQuery,
  useUpdateSpaceSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipPolicy,
  SpaceLevel,
  SpacePrivacyMode,
  SpaceSettingsCollaboration,
} from '@/core/apollo/generated/graphql-schema';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockCollapsible from '@/core/ui/content/PageContentBlockCollapsible';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import RadioSettingsGroup from '@/core/ui/forms/SettingsGroups/RadioSettingsGroup';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { BlockSectionTitle, BlockTitle, Caption, Text } from '@/core/ui/typography';
import scrollToTop from '@/core/ui/utils/scrollToTop';
import CommunityApplicationForm from '@/domain/community/community/CommunityApplicationForm/CommunityApplicationForm';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import type { SettingsPageProps } from '@/domain/platformAdmin/layout/EntitySettingsLayout/types';
import { Box, Button, CircularProgress, Link, useTheme } from '@mui/material';
import { noop } from 'lodash';
import { FC, useMemo, useState, useOptimistic, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import EntityConfirmDeleteDialog from '../../shared/components/EntityConfirmDeleteDialog';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';
import { defaultSpaceSettings } from './SpaceDefaultSettings';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CreateSpaceTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateSpaceTemplateDialog';

export interface SpaceAdminSettingsPageProps extends SettingsPageProps {
  useL0Layout: boolean;
  level: SpaceLevel;
  spaceId: string;
  parentSpaceUrl: string;
  membershipsEnabled: boolean;
  subspacesEnabled: boolean;
  privateSettingsEnabled: boolean;
}

const SpaceAdminSettingsPage: FC<SpaceAdminSettingsPageProps> = ({
  useL0Layout,
  level,
  parentSpaceUrl,
  spaceId,
  membershipsEnabled,
  subspacesEnabled,
  privateSettingsEnabled,
  routePrefix = '../',
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const notify = useNotification();

  const [saveAsTemplateDialogOpen, setSaveAsTemplateDialogOpen] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const openDialog = () => setOpenDeleteDialog(true);
  const closeDialog = () => setOpenDeleteDialog(false);
  const isSubspace = level !== SpaceLevel.L0;
  const notLastLevel = level !== SpaceLevel.L2;

  const [deleteSpace] = useDeleteSpaceMutation({
    onCompleted: () => {
      notify(t('pages.admin.space.notifications.space-removed'), 'success');
      window.location.replace(parentSpaceUrl);
    },
  });

  const { data } = useSpacePrivilegesQuery({
    variables: {
      spaceId: spaceId,
    },
    skip: !spaceId,
  });

  const privileges = data?.lookup.space?.authorization?.myPrivileges ?? [];
  const canDelete = privileges?.includes(AuthorizationPrivilege.Delete);

  const handleDelete = (id: string) => {
    return deleteSpace({
      variables: {
        spaceId: id,
      },
    });
  };

  const { data: settingsData, loading } = useSpaceSettingsQuery({
    variables: {
      spaceId,
    },
    skip: !spaceId,
  });
  const roleSetId = settingsData?.lookup.space?.about.membership.roleSetID;
  const provider = settingsData?.lookup.space?.about.provider;
  const hostId = provider?.id;

  // check for TemplateCreation privileges
  const { data: templateData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const templatesSet = templateData?.lookup.space?.templatesManager?.templatesSet;
  const templateSetPrivileges = templatesSet?.authorization?.myPrivileges ?? [];
  const canCreateTemplate = templateSetPrivileges?.includes(AuthorizationPrivilege.Create);

  const currentSettings = useMemo(() => {
    const settings = settingsData?.lookup.space?.settings;
    return {
      ...settings,
      hostOrganizationTrusted: (!!hostId && settings?.membership.trustedOrganizations.includes(hostId)) ?? false,
    };
  }, [settingsData, hostId]);

  const [updateSpaceSettings] = useUpdateSpaceSettingsMutation();

  // Optimistic state for immediate UI feedback
  const [optimisticSettings, setOptimisticSettings] = useOptimistic(
    currentSettings,
    (state, newSettings: Partial<typeof currentSettings>) => ({
      ...state,
      ...newSettings,
    })
  );

  const [, startTransition] = useTransition();

  const handleUpdateSettings = async ({
    privacyMode = currentSettings?.privacy?.mode ?? defaultSpaceSettings.privacy.mode,
    membershipPolicy = currentSettings?.membership?.policy ?? defaultSpaceSettings.membership.policy,
    allowSubspaceAdminsToInviteMembers = currentSettings?.membership?.allowSubspaceAdminsToInviteMembers ??
      defaultSpaceSettings.membership.allowSubspaceAdminsToInviteMembers,
    allowEventsFromSubspaces = currentSettings?.collaboration?.allowEventsFromSubspaces ??
      defaultSpaceSettings.collaboration.allowEventsFromSubspaces,
    allowMembersToCreateSubspaces = currentSettings?.collaboration?.allowMembersToCreateSubspaces ??
      defaultSpaceSettings.collaboration.allowMembersToCreateSubspaces,
    allowMembersToCreateCallouts = currentSettings?.collaboration?.allowMembersToCreateCallouts ??
      defaultSpaceSettings.collaboration.allowMembersToCreateCallouts,
    allowMembersToVideoCall = currentSettings?.collaboration?.allowMembersToVideoCall ??
      defaultSpaceSettings.collaboration.allowMembersToVideoCall,
    inheritMembershipRights = currentSettings?.collaboration?.inheritMembershipRights ??
      defaultSpaceSettings.collaboration.inheritMembershipRights,
    allowGuestContributions = currentSettings?.collaboration?.allowGuestContributions ??
      defaultSpaceSettings.collaboration.allowGuestContributions,
    hostOrganizationTrusted = currentSettings.hostOrganizationTrusted ??
      defaultSpaceSettings.membership.hostOrganizationTrusted,
    collaborationSettings = currentSettings.collaboration ?? defaultSpaceSettings.collaboration,
    showNotification = true,
    allowPlatformSupportAsAdmin = currentSettings.privacy?.allowPlatformSupportAsAdmin ??
      defaultSpaceSettings.privacy.allowPlatformSupportAsAdmin,
  }: {
    privacyMode?: SpacePrivacyMode;
    membershipPolicy?: CommunityMembershipPolicy;
    allowSubspaceAdminsToInviteMembers?: boolean;
    allowEventsFromSubspaces?: boolean;
    allowMembersToCreateSubspaces?: boolean;
    allowMembersToCreateCallouts?: boolean;
    allowMembersToVideoCall?: boolean;
    inheritMembershipRights?: boolean;
    allowGuestContributions?: boolean;
    hostOrganizationTrusted?: boolean;
    collaborationSettings?: Partial<SpaceSettingsCollaboration>;
    showNotification?: boolean;
    allowPlatformSupportAsAdmin?: boolean;
  }) => {
    const trustedOrganizations = [...(currentSettings?.membership?.trustedOrganizations ?? [])];
    if (hostOrganizationTrusted && hostId) {
      if (!trustedOrganizations.includes(hostId)) {
        trustedOrganizations.push(hostId);
      }
    } else {
      trustedOrganizations.splice(0, trustedOrganizations.length); // Clear the array
    }

    const settingsVariable = {
      privacy: {
        mode: privacyMode,
        allowPlatformSupportAsAdmin,
      },
      membership: {
        policy: membershipPolicy,
        trustedOrganizations,
        allowSubspaceAdminsToInviteMembers,
      },
      collaboration: {
        ...currentSettings.collaboration,
        ...collaborationSettings, // Overwrite with the passed values if any
        allowEventsFromSubspaces,
        allowMembersToCreateSubspaces,
        allowMembersToCreateCallouts,
        allowMembersToVideoCall,
        inheritMembershipRights,
        allowGuestContributions,
      } as SpaceSettingsCollaboration,
    };

    // Optimistically update UI immediately for better UX
    setOptimisticSettings({
      collaboration: {
        ...currentSettings.collaboration,
        allowEventsFromSubspaces,
        allowMembersToCreateSubspaces,
        allowMembersToCreateCallouts,
        allowMembersToVideoCall,
        inheritMembershipRights,
        allowGuestContributions,
      },
    });

    startTransition(async () => {
      await updateSpaceSettings({
        variables: {
          settingsData: {
            spaceID: spaceId,
            settings: settingsVariable,
          },
        },
      });

      if (showNotification) {
        notify(t('pages.admin.space.settings.savedSuccessfully'), 'success');
      }
    });
  };

  return (
    <LayoutSwitcher currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix} useL0Layout={useL0Layout}>
      <PageContent background="transparent">
        {!loading && (
          <>
            {privateSettingsEnabled && (
              <PageContentBlock>
                <BlockTitle>{t('pages.admin.space.settings.visibility.title')}</BlockTitle>
                <RadioSettingsGroup
                  value={currentSettings?.privacy?.mode}
                  options={{
                    [SpacePrivacyMode.Public]: {
                      label: (
                        <Trans
                          i18nKey={`pages.admin.space.settings.visibility.${isSubspace ? 'publicSubspace' : 'public'}`}
                          components={{ b: <strong /> }}
                        />
                      ),
                    },
                    [SpacePrivacyMode.Private]: {
                      label: (
                        <Trans
                          i18nKey={`pages.admin.space.settings.visibility.${
                            isSubspace ? 'privateSubspace' : 'private'
                          }`}
                          components={{ b: <strong /> }}
                        />
                      ),
                    },
                  }}
                  onChange={value => handleUpdateSettings({ privacyMode: value })}
                />
              </PageContentBlock>
            )}

            {membershipsEnabled && (
              <PageContentBlock>
                <BlockTitle>{t('pages.admin.space.settings.membership.title')}</BlockTitle>
                <RadioSettingsGroup
                  value={currentSettings?.membership?.policy}
                  options={{
                    [CommunityMembershipPolicy.Open]: {
                      label: (
                        <Trans i18nKey="pages.admin.space.settings.membership.open" components={{ b: <strong /> }} />
                      ),
                    },
                    [CommunityMembershipPolicy.Applications]: {
                      label: (
                        <Trans
                          i18nKey="pages.admin.space.settings.membership.applications"
                          components={{
                            b: <strong />,
                            community: <RouterLink to={`../${SettingsSection.Community}`} onClick={scrollToTop} />,
                          }}
                        />
                      ),
                    },
                    ...(notLastLevel && {
                      [CommunityMembershipPolicy.Invitations]: {
                        label: (
                          <Trans
                            i18nKey="pages.admin.space.settings.membership.invitations"
                            components={{
                              b: <strong />,
                              community: <RouterLink to={`../${SettingsSection.Community}`} onClick={scrollToTop} />,
                            }}
                          />
                        ),
                      },
                    }),
                  }}
                  onChange={value => handleUpdateSettings({ membershipPolicy: value })}
                />
                {!isSubspace && (
                  <>
                    <BlockSectionTitle>
                      {t('pages.admin.space.settings.membership.trustedApplicants')}
                    </BlockSectionTitle>
                    <SwitchSettingsGroup
                      options={{
                        hostOrganizationTrusted: {
                          checked: currentSettings.hostOrganizationTrusted,
                          label: (
                            <Trans
                              t={t}
                              i18nKey="pages.admin.space.settings.membership.hostOrganizationJoin"
                              values={{
                                host: provider?.profile.displayName,
                              }}
                              components={{ b: <strong />, i: <em /> }}
                            />
                          ),
                        },
                      }}
                      onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                    />
                  </>
                )}
              </PageContentBlock>
            )}

            {membershipsEnabled && (
              <PageContentBlockCollapsible header={<BlockTitle>{t('community.application-form.title')}</BlockTitle>}>
                <Text marginBottom={gutters(2)}>
                  <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
                </Text>
                <CommunityApplicationForm roleSetId={roleSetId!} />
              </PageContentBlockCollapsible>
            )}

            <PageContentBlock disableGap>
              <BlockTitle marginBottom={gutters(2)}>{t('pages.admin.space.settings.memberActions.title')}</BlockTitle>
              {notLastLevel && membershipsEnabled && (
                <SwitchSettingsGroup
                  options={{
                    allowSubspaceAdminsToInviteMembers: {
                      checked: currentSettings?.membership?.allowSubspaceAdminsToInviteMembers || false,
                      label: (
                        <Trans
                          i18nKey={
                            isSubspace
                              ? 'pages.admin.space.settings.membership.allowSubspaceAdminsToInviteMembersSubspace'
                              : 'pages.admin.space.settings.membership.allowSubspaceAdminsToInviteMembers'
                          }
                          components={{ b: <strong /> }}
                        />
                      ),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              )}

              <SwitchSettingsGroup
                options={{
                  allowMembersToCreateCallouts: {
                    checked: optimisticSettings?.collaboration?.allowMembersToCreateCallouts || false,
                    label: (
                      <Trans
                        i18nKey="pages.admin.space.settings.memberActions.createBlocks"
                        components={{ b: <strong /> }}
                      />
                    ),
                  },
                }}
                onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
              />
              <SwitchSettingsGroup
                options={{
                  allowMembersToVideoCall: {
                    checked: optimisticSettings?.collaboration?.allowMembersToVideoCall || false,
                    label: (
                      <Trans
                        i18nKey="pages.admin.space.settings.memberActions.videoCall"
                        components={{
                          b: <strong />,
                          jitsiInfoLink: <Link href="https://jitsi.org/" target="_blank" rel="noopener noreferrer" />,
                        }}
                      />
                    ),
                  },
                }}
                onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
              />
              <SwitchSettingsGroup
                options={{
                  allowGuestContributions: {
                    checked: optimisticSettings?.collaboration?.allowGuestContributions || false,
                    label: (
                      <Trans
                        i18nKey="pages.admin.space.settings.memberActions.guestContributions"
                        components={{ b: <strong /> }}
                      />
                    ),
                  },
                }}
                onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
              />
              {subspacesEnabled && (
                <SwitchSettingsGroup
                  options={{
                    allowMembersToCreateSubspaces: {
                      checked: optimisticSettings?.collaboration?.allowMembersToCreateSubspaces || false,
                      label: (
                        <Trans
                          i18nKey="pages.admin.space.settings.memberActions.createSubspaces"
                          components={{ b: <strong /> }}
                        />
                      ),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              )}
              {level !== SpaceLevel.L0 && (
                <SwitchSettingsGroup
                  options={{
                    inheritMembershipRights: {
                      checked: optimisticSettings?.collaboration?.inheritMembershipRights || false,
                      label: (
                        <Trans
                          i18nKey="pages.admin.space.settings.memberActions.inheritRights"
                          components={{ b: <strong /> }}
                        />
                      ),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              )}
              {!isSubspace && subspacesEnabled && (
                <SwitchSettingsGroup
                  options={{
                    allowEventsFromSubspaces: {
                      checked:
                        currentSettings.collaboration?.allowEventsFromSubspaces ??
                        defaultSpaceSettings.collaboration.allowEventsFromSubspaces,
                      label: (
                        <Trans
                          i18nKey="pages.admin.space.settings.memberActions.eventsFromSubspaces"
                          components={{ b: <strong /> }}
                        />
                      ),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              )}
              {!isSubspace && subspacesEnabled && (
                <SwitchSettingsGroup
                  options={{
                    allowPlatformSupportAsAdmin: {
                      checked: currentSettings?.privacy?.allowPlatformSupportAsAdmin || false,
                      label: (
                        <Trans
                          i18nKey="pages.admin.space.settings.memberActions.supportAsAdmin"
                          components={{ b: <strong /> }}
                        />
                      ),
                    },
                  }}
                  onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
                />
              )}
            </PageContentBlock>
            {isSubspace && (
              <PageContentBlock>
                <PageContentBlockHeader title={t('pages.admin.space.settings.copySpace.title')} />
                <Text>{t('pages.admin.space.settings.copySpace.description')}</Text>
                <Gutters disablePadding row>
                  {canCreateTemplate ? (
                    <Button variant="contained" onClick={() => setSaveAsTemplateDialogOpen(true)}>
                      {t('pages.admin.space.settings.copySpace.createTemplate')}
                    </Button>
                  ) : (
                    <ButtonWithTooltip
                      tooltip={t('pages.admin.space.settings.copySpace.createTemplateTooltip')}
                      tooltipPlacement="right"
                      variant="outlined"
                      onClick={noop}
                    >
                      {t('pages.admin.space.settings.copySpace.createTemplate')}
                    </ButtonWithTooltip>
                  )}
                  <Button variant="outlined" onClick={/* PENDING */ () => {}} disabled>
                    {t('pages.admin.space.settings.copySpace.duplicate')}
                  </Button>
                </Gutters>
                {saveAsTemplateDialogOpen && templatesSet && (
                  <CreateSpaceTemplateDialog
                    open
                    onClose={() => setSaveAsTemplateDialogOpen(false)}
                    spaceId={spaceId}
                    templatesSetId={templatesSet.id}
                  />
                )}
              </PageContentBlock>
            )}
            {isSubspace && canDelete && (
              <PageContentBlock sx={{ borderColor: theme.palette.error.main }}>
                <PageContentBlockHeader
                  sx={{ color: theme.palette.error.main }}
                  title={t('components.deleteEntity.title')}
                />
                <Box display="flex" gap={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={openDialog}>
                  <DeleteOutlineIcon color="error" />
                  <Caption>{t('components.deleteEntity.description', { entity: t('common.subspace') })}</Caption>
                </Box>
              </PageContentBlock>
            )}
            {openDeleteDialog && (
              <EntityConfirmDeleteDialog
                entity={t('common.subspace')}
                open={openDeleteDialog}
                onClose={closeDialog}
                onDelete={() => handleDelete(spaceId)}
              />
            )}
          </>
        )}
        {loading && (
          <Box marginX="auto">
            <CircularProgress />
          </Box>
        )}
      </PageContent>
    </LayoutSwitcher>
  );
};

export default SpaceAdminSettingsPage;
