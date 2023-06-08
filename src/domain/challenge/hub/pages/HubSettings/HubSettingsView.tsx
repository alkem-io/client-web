import { FC, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import scrollToTop from '../../../../../common/utils/scroll/scrollToTop';
import {
  useHubPreferencesQuery,
  useUpdatePreferenceOnHubMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { HubPreferenceType, PreferenceType } from '../../../../../core/apollo/generated/graphql-schema';
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
import { useHub } from '../../HubContext/useHub';
import { Box, CircularProgress } from '@mui/material';

export const HubSettingsView: FC = () => {
  const { t } = useTranslation();
  const { hubNameId } = useHub();
  const notify = useNotification();

  const { data: preferencesData, loading } = useHubPreferencesQuery({
    variables: {
      hubNameId,
    },
    skip: !hubNameId,
  });
  const [updatePreference] = useUpdatePreferenceOnHubMutation();

  const handleUpdatePreference = async (
    preference: HubPreferenceType,
    newValue: string,
    showNotification: boolean = true
  ) => {
    await updatePreference({
      variables: {
        preferenceData: {
          hubID: hubNameId,
          type: preference,
          value: newValue,
        },
      },
    });
    if (showNotification) {
      notify(t('pages.admin.hub.settings.savedSuccessfully'), 'success');
    }
  };

  const getBooleanPreferenceValue = useCallback(
    (preference: PreferenceType) => {
      const value = preferencesData?.hub.preferences?.find(pref => pref.definition.type === preference)?.value;
      return value === 'true' ? true : value === 'false' ? false : undefined;
    },
    [preferencesData]
  );

  // Visibility:
  const currentVisibilityValue = useMemo(() => {
    const value = getBooleanPreferenceValue(PreferenceType.AuthorizationAnonymousReadAccess);
    return value === undefined ? undefined : value ? 'public' : 'private';
  }, [preferencesData]);

  // Membership
  const currentMembershipValue = useMemo(() => {
    const preferences = {
      MembershipJoinHubFromAnyone: getBooleanPreferenceValue(PreferenceType.MembershipJoinHubFromAnyone),
      MembershipApplicationsFromAnyone: getBooleanPreferenceValue(PreferenceType.MembershipApplicationsFromAnyone),
    };

    if (
      preferences.MembershipJoinHubFromAnyone === undefined ||
      preferences.MembershipApplicationsFromAnyone === undefined
    ) {
      return undefined;
    }
    if (preferences.MembershipJoinHubFromAnyone && preferences.MembershipApplicationsFromAnyone) {
      return 'applicationRequired';
    } else if (preferences.MembershipJoinHubFromAnyone && !preferences.MembershipApplicationsFromAnyone) {
      return 'noApplicationRequired';
    } else if (!preferences.MembershipJoinHubFromAnyone && !preferences.MembershipApplicationsFromAnyone) {
      return 'invitationOnly';
    }
  }, [preferencesData]);

  const onMembershipChange = async (value: 'noApplicationRequired' | 'applicationRequired' | 'invitationOnly') => {
    await handleUpdatePreference(
      HubPreferenceType.MembershipJoinHubFromAnyone,
      value === 'noApplicationRequired' || value === 'applicationRequired' ? 'true' : 'false',
      false
    );
    await handleUpdatePreference(
      HubPreferenceType.MembershipApplicationsFromAnyone,
      value === 'noApplicationRequired' || value === 'invitationOnly' ? 'false' : 'true',
      true
    );
  };

  return (
    <PageContent background="transparent">
      {!loading && (
        <>
          <PageContentBlock>
            <BlockTitle>{t('pages.admin.hub.settings.visibility.title')}</BlockTitle>
            <RadioSettingsGroup
              value={currentVisibilityValue}
              options={{
                public: {
                  label: <Trans i18nKey="pages.admin.hub.settings.visibility.public" components={{ b: <strong /> }} />,
                },
                private: {
                  label: <Trans i18nKey="pages.admin.hub.settings.visibility.private" components={{ b: <strong /> }} />,
                },
              }}
              onChange={newValue =>
                handleUpdatePreference(
                  HubPreferenceType.AuthorizationAnonymousReadAccess,
                  newValue === 'public' ? 'true' : 'false'
                )
              }
            />
          </PageContentBlock>

          <PageContentBlock>
            <BlockTitle>{t('pages.admin.hub.settings.membership.title')}</BlockTitle>
            <RadioSettingsGroup
              value={currentMembershipValue}
              options={{
                noApplicationRequired: {
                  label: (
                    <Trans
                      i18nKey="pages.admin.hub.settings.membership.noApplicationRequired"
                      components={{ b: <strong /> }}
                    />
                  ),
                },
                applicationRequired: {
                  label: (
                    <Trans
                      i18nKey="pages.admin.hub.settings.membership.applicationRequired"
                      components={{
                        b: <strong />,
                        community: <RouterLink to={`../${SettingsSection.Community}`} onClick={scrollToTop} />,
                      }}
                    />
                  ),
                },
                invitationOnly: {
                  label: (
                    <Trans
                      i18nKey="pages.admin.hub.settings.membership.invitationOnly"
                      components={{
                        b: <strong />,
                        community: <RouterLink to={`../${SettingsSection.Community}`} onClick={scrollToTop} />,
                      }}
                    />
                  ),
                },
              }}
              onChange={newValue => onMembershipChange(newValue)}
            />

            <BlockSectionTitle>{t('pages.admin.hub.settings.membership.trustedApplicants')}</BlockSectionTitle>
            <SwitchSettingsGroup
              options={{
                trustHostOrganization: {
                  checked:
                    getBooleanPreferenceValue(PreferenceType.MembershipJoinHubFromHostOrganizationMembers) ?? false,
                  label: (
                    <Trans
                      i18nKey="pages.admin.hub.settings.membership.hostOrganizationJoin"
                      components={{ b: <strong /> }}
                    />
                  ),
                },
              }}
              onChange={(setting, newValue) => {
                if (setting === 'trustHostOrganization') {
                  return handleUpdatePreference(
                    HubPreferenceType.MembershipJoinHubFromHostOrganizationMembers,
                    newValue ? 'true' : 'false'
                  );
                }
              }}
            />
          </PageContentBlock>

          <PageContentBlockCollapsible header={<BlockTitle>{t('community.application-form.title')}</BlockTitle>}>
            <Text marginBottom={gutters(2)}>
              <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
            </Text>
            <CommunityApplicationForm hubId={hubNameId} />
          </PageContentBlockCollapsible>

          <PageContentBlock>
            <BlockTitle>{t('pages.admin.hub.settings.memberActions.title')}</BlockTitle>
            <SwitchSettingsGroup
              options={{
                createBlocks: {
                  checked: getBooleanPreferenceValue(PreferenceType.AllowMembersToCreateCallouts) ?? false,
                  label: (
                    <Trans
                      i18nKey="pages.admin.hub.settings.memberActions.createBlocks"
                      components={{ b: <strong /> }}
                    />
                  ),
                },
                createChallenges: {
                  checked: getBooleanPreferenceValue(PreferenceType.AllowMembersToCreateChallenges) ?? false,
                  label: (
                    <Trans
                      i18nKey="pages.admin.hub.settings.memberActions.createChallenges"
                      components={{ b: <strong /> }}
                    />
                  ),
                },
              }}
              onChange={async (setting, newValue) => {
                if (setting === 'createBlocks') {
                  await handleUpdatePreference(
                    HubPreferenceType.AllowMembersToCreateCallouts,
                    newValue ? 'true' : 'false'
                  );
                }
                if (setting === 'createChallenges') {
                  await handleUpdatePreference(
                    HubPreferenceType.AllowMembersToCreateChallenges,
                    newValue ? 'true' : 'false'
                  );
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

export default HubSettingsView;
