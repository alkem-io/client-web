import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import { Trans, useTranslation } from 'react-i18next';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { CommunityMembershipPolicy, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';
import { useSpaceSettingsQuery, useUpdateSpaceSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import { BlockTitle } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import RadioSettingsGroup from '@/core/ui/forms/SettingsGroups/RadioSettingsGroup';

interface SubspaceAuthorizationPageProps extends SettingsPageProps {}

const SubspaceAuthorizationPage = ({ routePrefix = '../' }: SubspaceAuthorizationPageProps) => {
  const { t } = useTranslation();
  const { subspace } = useSubSpace();
  const challengeId = subspace.id;
  const { data: settingsData, loading } = useSpaceSettingsQuery({
    variables: {
      spaceId: challengeId,
    },
  });
  const [updateSubspaceSettings] = useUpdateSpaceSettingsMutation();
  const settings = settingsData?.lookup.space?.settings;

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
    await updateSubspaceSettings({
      variables: {
        settingsData: {
          spaceID: challengeId,
          settings: {
            privacy: {
              mode: privacyMode,
              allowPlatformSupportAsAdmin: settings?.privacy.allowPlatformSupportAsAdmin ?? false,
            },
            membership: {
              policy: membershipPolicy,
              trustedOrganizations: hostOrgTrusted ? ['myHostOrgID-TODO'] : [],
              allowSubspaceAdminsToInviteMembers: settings?.membership.allowSubspaceAdminsToInviteMembers ?? false,
            },
            collaboration: {
              allowMembersToCreateCallouts: true,
              allowMembersToCreateSubspaces: true,
              inheritMembershipRights: true,
              allowEventsFromSubspaces: true,
            },
          },
        },
      },
    });
  };

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
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
              onChange={handleUpdateSettings}
            />
          </PageContentBlock>
        </>
      )}
    </SubspaceSettingsLayout>
  );
};

export default SubspaceAuthorizationPage;
