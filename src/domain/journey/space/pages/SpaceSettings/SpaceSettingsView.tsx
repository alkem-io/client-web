import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import scrollToTop from '../../../../../core/ui/utils/scrollToTop';
import {
  useSpaceHostQuery,
  useSpaceSettingsQuery,
  useUpdateSpaceSettingsMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { CommunityMembershipPolicy, SpacePrivacyMode } from '../../../../../core/apollo/generated/graphql-schema';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockCollapsible from '../../../../../core/ui/content/PageContentBlockCollapsible';
import RadioSettingsGroup from '../../../../../core/ui/forms/SettingsGroups/RadioSettingsGroup';
import SwitchSettingsGroup from '../../../../../core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { gutters } from '../../../../../core/ui/grid/utils';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { BlockSectionTitle, BlockTitle, Text } from '../../../../../core/ui/typography';
import CommunityApplicationForm from '../../../../community/community/CommunityApplicationForm/CommunityApplicationForm';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { Box, CircularProgress } from '@mui/material';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';

export const SpaceSettingsView: FC = () => {
  const { t } = useTranslation();
  const { spaceNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space route.');
  }

  const { data: hostOrganization } = useSpaceHostQuery({
    variables: { spaceId: spaceNameId },
  });

  const notify = useNotification();

  const { data: settingsData, loading } = useSpaceSettingsQuery({
    variables: {
      spaceNameId: spaceNameId,
    },
  });
  const [updateSpaceSettings] = useUpdateSpaceSettingsMutation();
  const settings = settingsData?.space.settings;
  const trustedOrganizations = settings?.membership.trustedOrganizations || [];

  const handleUpdateSettings = async (
    privacyModeUpdate?: SpacePrivacyMode,
    membershipPolicyUpdate?: CommunityMembershipPolicy,
    hostOrgTrustedUpdate?: boolean,
    showNotification: boolean = true
  ) => {
    const privacyMode = privacyModeUpdate ? privacyModeUpdate : settings?.privacy.mode ?? SpacePrivacyMode.Public;
    const membershipPolicy =
      membershipPolicyUpdate ?? settings?.membership.policy ?? CommunityMembershipPolicy.Invitations;
    const hostOrgArray = settings?.membership.trustedOrganizations ?? [];
    const hostOrgTrusted = hostOrgTrustedUpdate ?? hostOrgArray.length > 0;
    await updateSpaceSettings({
      variables: {
        settingsData: {
          spaceID: spaceNameId,
          settings: {
            privacy: {
              mode: privacyMode,
            },
            membership: {
              policy: membershipPolicy,
              trustedOrganizations: hostOrgTrusted ? ['myHostOrgID-TODO'] : [],
            },
            collaboration: {
              allowMembersToCreateCallouts: true,
              allowMembersToCreateSubspaces: true,
              inheritMembershipRights: true,
            },
          },
        },
      },
    });
    if (showNotification) {
      notify(t('pages.admin.space.settings.savedSuccessfully'), 'success');
    }
  };

  return (
    <PageContent background="transparent">
      {!loading && (
        <>
          <PageContentBlock>
            <BlockTitle>{t('pages.admin.space.settings.visibility.title')}</BlockTitle>
            <RadioSettingsGroup
              value={settings?.privacy.mode}
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
              onChange={value => handleUpdateSettings(value, undefined, undefined, false)}
            />
          </PageContentBlock>

          <PageContentBlock>
            <BlockTitle>{t('pages.admin.space.settings.membership.title')}</BlockTitle>
            <RadioSettingsGroup
              value={settings?.membership.policy}
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
              }}
              onChange={value => handleUpdateSettings(undefined, value, undefined, false)}
            />

            <BlockSectionTitle>{t('pages.admin.space.settings.membership.trustedApplicants')}</BlockSectionTitle>
            <SwitchSettingsGroup
              options={{
                trustHostOrganization: {
                  checked: trustedOrganizations.length > 0 ? true : false,
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
              onChange={value =>
                handleUpdateSettings(undefined, undefined, value === 'trustHostOrganization' ? true : false, false)
              }
            />
          </PageContentBlock>

          <PageContentBlockCollapsible header={<BlockTitle>{t('community.application-form.title')}</BlockTitle>}>
            <Text marginBottom={gutters(2)}>
              <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
            </Text>
            <CommunityApplicationForm spaceId={spaceNameId} />
          </PageContentBlockCollapsible>

          <PageContentBlock>
            <BlockTitle>{t('pages.admin.space.settings.memberActions.title')}</BlockTitle>
            <SwitchSettingsGroup
              options={{
                createBlocks: {
                  checked: false,
                  label: (
                    <Trans
                      i18nKey="pages.admin.space.settings.memberActions.createBlocks"
                      components={{ b: <strong /> }}
                    />
                  ),
                },
                createChallenges: {
                  checked: false,
                  label: (
                    <Trans
                      i18nKey="pages.admin.space.settings.memberActions.createSubspaces"
                      components={{ b: <strong /> }}
                    />
                  ),
                },
              }}
              onChange={async setting => {
                if (setting === 'createBlocks') {
                  await handleUpdateSettings();
                }
                if (setting === 'createChallenges') {
                  await handleUpdateSettings();
                }
              }}
            />
          </PageContentBlock>
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
