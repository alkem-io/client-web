import { FC, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import scrollToTop from '../../../../../core/ui/utils/scrollToTop';
import {
  refetchAdminSpaceChallengesPageQuery,
  refetchAdminSpacesListQuery,
  useDeleteSpaceMutation,
  useSpaceHostQuery,
  useSpaceSettingsQuery,
  useUpdateSpaceSettingsMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
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
import { DeleteIcon } from './icon/DeleteIcon';
import { theme } from '../../../../../core/ui/themes/default/Theme';
import SpaceProfileDeleteDialog from './SpaceProfileDeleteDialog';
import { ROUTE_HOME } from '../../../../platform/routes/constants';
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
  },
  collaboration: {
    allowMembersToCreateCallouts: true,
    allowMembersToCreateSubspaces: true,
    inheritMembershipRights: true,
  },
};

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

  const translatedEntity = t(`common.${isSubspace ? 'subspace' : 'space'}` as const);

  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: isSubspace
      ? [
          refetchAdminSpaceChallengesPageQuery({
            spaceId: spaceNameId,
          }),
        ]
      : [refetchAdminSpacesListQuery()],
    awaitRefetchQueries: true,
    onCompleted: data => {
      notify(t('pages.admin.space.notifications.space-removed', { name: data.deleteSpace.nameID }), 'success');
      navigate(`${isSubspace ? '/' + spaceNameId : ROUTE_HOME}`, { replace: true });
    },
  });

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
    hostOrganizationTrusted = currentSettings.hostOrganizationTrusted ??
      defaultSpaceSettings.membership.hostOrganizationTrusted,
    collaborationSettings = currentSettings.collaboration ?? defaultSpaceSettings.collaboration,
    showNotification = true,
  }: {
    privacyMode?: SpacePrivacyMode;
    membershipPolicy?: CommunityMembershipPolicy;
    hostOrganizationTrusted?: boolean;
    collaborationSettings?: Partial<SpaceSettingsCollaboration>;
    showNotification?: boolean;
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
        allowPlatformSupportAsAdmin: currentSettings.privacy?.allowPlatformSupportAsAdmin ?? false,
      },
      membership: {
        policy: membershipPolicy,
        trustedOrganizations,
        allowSubspaceAdminsToInviteMembers: currentSettings.membership?.allowSubspaceAdminsToInviteMembers ?? false,
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

          <PageContentBlock>
            <BlockTitle>{t('pages.admin.space.settings.memberActions.title')}</BlockTitle>
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
          </PageContentBlock>

          <PageContentBlock sx={{ borderColor: theme.palette.error.main }}>
            <PageContentBlockHeader
              sx={{ color: theme.palette.error.main }}
              title={t('components.deleteSpace.title')}
            />
            <Box display="flex" gap={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={openDialog}>
              <DeleteIcon />
              <Caption>{t('components.deleteSpace.description', { entity: translatedEntity })}</Caption>
            </Box>
          </PageContentBlock>
          {openDeleteDialog && (
            <SpaceProfileDeleteDialog
              entity={translatedEntity}
              open={openDeleteDialog}
              onClose={closeDialog}
              onDelete={() => handleDelete(isSubspace ? subspaceId : journeyId)}
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
