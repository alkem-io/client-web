import { FC, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import scrollToTop from '../../../../../core/ui/utils/scrollToTop';
import {
  refetchAdminSpaceChallengesPageQuery,
  useDeleteSpaceMutation,
  useSpaceHostQuery,
  useSpacePrivilegesQuery,
  useSpaceSettingsQuery,
  useUpdateSpaceSettingsMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipPolicy,
  SpacePrivacyMode,
  SpaceSettingsCollaboration,
} from '../../../../../core/apollo/generated/graphql-schema';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockCollapsible from '../../../../../core/ui/content/PageContentBlockCollapsible';
import RadioSettingsGroup from '../../../../../core/ui/forms/SettingsGroups/RadioSettingsGroup';
import SwitchSettingsGroup from '../../../../../core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { gutters } from '../../../../../core/ui/grid/utils';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { BlockSectionTitle, BlockTitle, Caption, Text } from '../../../../../core/ui/typography';
import CommunityApplicationForm from '../../../../community/community/CommunityApplicationForm/CommunityApplicationForm';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { Box, CircularProgress } from '@mui/material';
import { JourneyTypeName } from '../../../JourneyTypeName';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import DeleteIcon from './icon/DeleteIcon';
import SpaceProfileDeleteDialog from './SpaceProfileDeleteDialog';
import { useSubSpace } from '../../../subspace/hooks/useChallenge';
import { useSpace } from '../../SpaceContext/useSpace';

interface SpaceSettingsViewProps {
  journeyId: string;
  journeyTypeName: JourneyTypeName; // TODO: The idea is to just pass isSubspace as a boolean here
}

const defaultSpaceSettings = {
  privacy: {
    mode: SpacePrivacyMode.Public,
    allowPlatformSupportAsAdmin: false,
  },
  membership: {
    policy: CommunityMembershipPolicy.Invitations,
    trustedOrganizations: [],
    hostOrganizationTrusted: false, // Computed from `trustedOrganizations`
    allowSubspaceAdminsToInviteMembers: true,
  },
  collaboration: {
    allowMembersToCreateCallouts: true,
    allowMembersToCreateSubspaces: true,
    inheritMembershipRights: true,
  },
};

const errorColor = '#940000';

export const SpaceSettingsView: FC<SpaceSettingsViewProps> = ({ journeyId, journeyTypeName }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();
  const isSubspace = journeyTypeName !== 'space';

  const { subspaceId } = useSubSpace();
  const { spaceNameId } = useSpace();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const openDialog = () => setOpenDeleteDialog(true);
  const closeDialog = () => setOpenDeleteDialog(false);

  const [deleteSpace, { loading: deletingSpace }] = useDeleteSpaceMutation({
    refetchQueries: [
      refetchAdminSpaceChallengesPageQuery({
        spaceId: spaceNameId,
      }),
    ],
    awaitRefetchQueries: true,
    onCompleted: data => {
      notify(t('pages.admin.space.notifications.space-removed', { name: data.deleteSpace.nameID }), 'success');
      navigate(`/${spaceNameId}`, { replace: true });
    },
  });

  const { data } = useSpacePrivilegesQuery({
    variables: {
      spaceId: subspaceId,
    },
    skip: !subspaceId,
  });

  const privileges = data?.lookup.space?.authorization?.myPrivileges ?? [];
  const canDelete = privileges?.includes(AuthorizationPrivilege.Delete);

  const handleDelete = (id: string) => {
    deleteSpace({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  const { data: hostOrganization } = useSpaceHostQuery({
    variables: { spaceNameId: journeyId },
    skip: isSubspace,
  });
  const hostOrganizationId = hostOrganization?.space.account.host?.id;

  const { data: settingsData, loading } = useSpaceSettingsQuery({
    variables: {
      spaceId: journeyId,
    },
  });
  const communityId = settingsData?.lookup.space?.community?.id;

  const currentSettings = useMemo(() => {
    const settings = settingsData?.lookup.space?.settings;
    return {
      ...settings,
      hostOrganizationTrusted:
        (!!hostOrganizationId && settings?.membership.trustedOrganizations.includes(hostOrganizationId)) ?? false,
    };
  }, [settingsData, hostOrganizationId]);

  const [updateSpaceSettings] = useUpdateSpaceSettingsMutation();

  const handleUpdateSettings = async ({
    privacyMode = currentSettings?.privacy?.mode ?? defaultSpaceSettings.privacy.mode,
    membershipPolicy = currentSettings?.membership?.policy ?? defaultSpaceSettings.membership.policy,
    allowSubspaceAdminsToInviteMembers = currentSettings?.membership?.allowSubspaceAdminsToInviteMembers ??
      defaultSpaceSettings.membership.allowSubspaceAdminsToInviteMembers,
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
    hostOrganizationTrusted?: boolean;
    collaborationSettings?: Partial<SpaceSettingsCollaboration>;
    showNotification?: boolean;
    allowPlatformSupportAsAdmin?: boolean;
  }) => {
    const trustedOrganizations = [...(currentSettings?.membership?.trustedOrganizations ?? [])];
    if (hostOrganizationTrusted && hostOrganizationId) {
      if (!trustedOrganizations.includes(hostOrganizationId)) {
        trustedOrganizations.push(hostOrganizationId);
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
      } as SpaceSettingsCollaboration,
    };

    switch (journeyTypeName) {
      case 'space': {
        await updateSpaceSettings({
          variables: {
            settingsData: {
              spaceID: journeyId,
              settings: settingsVariable,
            },
          },
        });
        break;
      }
      case 'subspace': {
        await updateSpaceSettings({
          variables: {
            settingsData: {
              spaceID: journeyId,
              settings: settingsVariable,
            },
          },
        });
        break;
      }
      // TODO: Add opportunity case
    }
    if (showNotification) {
      notify(t('pages.admin.space.settings.savedSuccessfully'), 'success');
    }
  };

  const getMemberActions = () => {
    const spaceActions = {
      allowMembersToCreateCallouts: {
        checked:
          currentSettings.collaboration?.allowMembersToCreateCallouts ??
          defaultSpaceSettings.collaboration.allowMembersToCreateCallouts,
        label: <Trans i18nKey="pages.admin.space.settings.memberActions.createBlocks" components={{ b: <strong /> }} />,
      },
      allowMembersToCreateSubspaces: {
        checked:
          currentSettings.collaboration?.allowMembersToCreateSubspaces ??
          defaultSpaceSettings.collaboration.allowMembersToCreateSubspaces,
        label: (
          <Trans i18nKey="pages.admin.space.settings.memberActions.createSubspaces" components={{ b: <strong /> }} />
        ),
      },
    };

    if (isSubspace) {
      // show inheritMembershipRights only for subspaces
      return {
        ...spaceActions,
        inheritMembershipRights: {
          checked:
            currentSettings.collaboration?.inheritMembershipRights ??
            defaultSpaceSettings.collaboration.inheritMembershipRights,
          label: <Trans i18nKey="pages.admin.space.settings.memberActions.inheritRights" />,
        },
      };
    }

    return spaceActions;
  };

  return (
    <PageContent background="transparent">
      {!loading && (
        <>
          <PageContentBlock>
            <BlockTitle>{t('pages.admin.space.settings.visibility.title')}</BlockTitle>
            <RadioSettingsGroup
              value={currentSettings?.privacy?.mode}
              options={{
                [SpacePrivacyMode.Public]: {
                  label: (
                    <Trans i18nKey="pages.admin.space.settings.visibility.public" components={{ b: <strong /> }} />
                  ),
                },
                [SpacePrivacyMode.Private]: {
                  label: (
                    <Trans i18nKey="pages.admin.space.settings.visibility.private" components={{ b: <strong /> }} />
                  ),
                },
              }}
              onChange={value => handleUpdateSettings({ privacyMode: value })}
            />
          </PageContentBlock>

          <PageContentBlock>
            <BlockTitle>{t('pages.admin.space.settings.membership.title')}</BlockTitle>
            <RadioSettingsGroup
              value={currentSettings?.membership?.policy}
              options={{
                [CommunityMembershipPolicy.Open]: {
                  label: <Trans i18nKey="pages.admin.space.settings.membership.open" components={{ b: <strong /> }} />,
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
                ...(!isSubspace && {
                  // Only show this option for top level spaces
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
                <BlockSectionTitle>{t('pages.admin.space.settings.membership.trustedApplicants')}</BlockSectionTitle>
                <SwitchSettingsGroup
                  options={{
                    hostOrganizationTrusted: {
                      checked: currentSettings.hostOrganizationTrusted,
                      label: (
                        <Trans
                          t={t}
                          i18nKey="pages.admin.space.settings.membership.hostOrganizationJoin"
                          values={{
                            host: hostOrganization?.space?.account.host?.profile?.displayName,
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

          <PageContentBlockCollapsible header={<BlockTitle>{t('community.application-form.title')}</BlockTitle>}>
            <Text marginBottom={gutters(2)}>
              <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
            </Text>
            <CommunityApplicationForm communityId={communityId} />
          </PageContentBlockCollapsible>

          <PageContentBlock disableGap>
            <BlockTitle marginBottom={gutters(2)}>{t('pages.admin.space.settings.memberActions.title')}</BlockTitle>
            <SwitchSettingsGroup
              options={getMemberActions()}
              onChange={async (setting, newValue) => {
                await handleUpdateSettings({
                  collaborationSettings: {
                    [setting]: newValue,
                  },
                });
              }}
            />
            {!isSubspace && (
              <SwitchSettingsGroup
                options={{
                  allowSubspaceAdminsToInviteMembers: {
                    checked: currentSettings?.membership?.allowSubspaceAdminsToInviteMembers || false,
                    label: t('pages.admin.space.settings.membership.allowSubspaceAdminsToInviteMembers'),
                  },
                }}
                onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
              />
            )}
            {!isSubspace && (
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

          {isSubspace && canDelete && (
            <PageContentBlock sx={{ borderColor: errorColor }}>
              <PageContentBlockHeader sx={{ color: errorColor }} title={t('components.deleteSpace.title')} />
              <Box display="flex" gap={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={openDialog}>
                <DeleteIcon />
                <Caption>{t('components.deleteSpace.description', { entity: t('common.subspace') })}</Caption>
              </Box>
            </PageContentBlock>
          )}
          {openDeleteDialog && (
            <SpaceProfileDeleteDialog
              entity={t('common.subspace')}
              open={openDeleteDialog}
              onClose={closeDialog}
              onDelete={() => handleDelete(subspaceId)}
              submitting={deletingSpace}
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
  );
};

export default SpaceSettingsView;
