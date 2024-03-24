import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import { Trans, useTranslation } from 'react-i18next';
import { useChallenge } from '../../hooks/useChallenge';
import { CommunityMembershipPolicy, SpacePrivacyMode } from '../../../../../core/apollo/generated/graphql-schema';
import {
  useChallengeSettingsQuery,
  useUpdateChallengeSettingsMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { BlockTitle } from '../../../../../core/ui/typography/components';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import RadioSettingsGroup from '../../../../../core/ui/forms/SettingsGroups/RadioSettingsGroup';

interface ChallengeAuthorizationPageProps extends SettingsPageProps {}

const ChallengeAuthorizationPage: FC<ChallengeAuthorizationPageProps> = ({ routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { challengeId } = useChallenge();
  const { data: settingsData, loading } = useChallengeSettingsQuery({
    variables: {
      challengeId: challengeId,
    },
  });
  const [updateChallengeSettings] = useUpdateChallengeSettingsMutation();
  const settings = settingsData?.lookup.challenge?.settings;

  const handleUpdateSettings = async (
    privacyModeUpdate?: SpacePrivacyMode,
    membershipPolicyUpdate?: CommunityMembershipPolicy,
    hostOrgTrustedUpdate?: boolean
  ) => {
    const privacyMode = privacyModeUpdate ? privacyModeUpdate : settings?.privacy.mode ?? SpacePrivacyMode.Public;
    const membershipPolicy =
      membershipPolicyUpdate ?? settings?.membership.policy ?? CommunityMembershipPolicy.Invitations;
    const hostOrgArray = settings?.membership.trustedOrganizations ?? [];
    const hostOrgTrusted = hostOrgTrustedUpdate ?? hostOrgArray.length > 0;
    await updateChallengeSettings({
      variables: {
        settingsData: {
          challengeID: challengeId,
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
  };

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
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
              onChange={handleUpdateSettings()}
            />
          </PageContentBlock>
        </>
      )}
    </ChallengeSettingsLayout>
  );
};

export default ChallengeAuthorizationPage;
