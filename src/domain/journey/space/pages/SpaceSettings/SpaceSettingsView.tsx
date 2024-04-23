import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import scrollToTop from '../../../../../core/ui/utils/scrollToTop';
import {
  useSpaceHostQuery,
  useSpacePreferencesQuery,
  useUpdatePreferenceOnSpaceMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { SpacePreferenceType, PreferenceType } from '../../../../../core/apollo/generated/graphql-schema';
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
import { isEqual } from 'lodash';

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

  const { data: preferencesData, loading } = useSpacePreferencesQuery({
    variables: {
      spaceNameId: spaceNameId,
    },
  });
  const [updatePreference] = useUpdatePreferenceOnSpaceMutation();

  const handleUpdatePreference = async (
    preference: SpacePreferenceType,
    newValue: string,
    showNotification: boolean = true
  ) => {
    await updatePreference({
      variables: {
        preferenceData: {
          spaceID: spaceNameId,
          type: preference,
          value: newValue,
        },
      },
    });
    if (showNotification) {
      notify(t('pages.admin.space.settings.savedSuccessfully'), 'success');
    }
  };

  const getBooleanPreferenceValue = (preference: PreferenceType) => {
    const value = preferencesData?.space.preferences?.find(pref => pref.definition.type === preference)?.value;
    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    }
    return undefined;
  };

  // Visibility:
  const getVisibilityValue = () => {
    const value = getBooleanPreferenceValue(PreferenceType.AuthorizationAnonymousReadAccess);
    if (value === undefined) {
      return undefined;
    }
    return value ? 'public' : 'private';
  };

  // Membership
  enum MembershipOption {
    noApplicationRequired = 'noApplicationRequired',
    applicationRequired = 'applicationRequired',
    invitationOnly = 'invitationOnly',
  }
  // There are 2 preferences for the 3 different options:
  const membershipTruthTable = {
    [MembershipOption.noApplicationRequired]: {
      [PreferenceType.MembershipApplicationsFromAnyone]: false,
      [PreferenceType.MembershipJoinSpaceFromAnyone]: true,
    },
    [MembershipOption.applicationRequired]: {
      [PreferenceType.MembershipApplicationsFromAnyone]: true,
      [PreferenceType.MembershipJoinSpaceFromAnyone]: false,
    },
    [MembershipOption.invitationOnly]: {
      [PreferenceType.MembershipApplicationsFromAnyone]: false,
      [PreferenceType.MembershipJoinSpaceFromAnyone]: false,
    },
  };

  const getMembershipValue = () => {
    const preferences = {
      [PreferenceType.MembershipApplicationsFromAnyone]: getBooleanPreferenceValue(
        PreferenceType.MembershipApplicationsFromAnyone
      ),
      [PreferenceType.MembershipJoinSpaceFromAnyone]: getBooleanPreferenceValue(
        PreferenceType.MembershipJoinSpaceFromAnyone
      ),
    };

    for (const [key, value] of Object.entries(membershipTruthTable)) {
      if (isEqual(preferences, value)) {
        return key as MembershipOption;
      }
    }
  };

  const onMembershipChange = async (value: MembershipOption) => {
    const currentPreferences = {
      [PreferenceType.MembershipApplicationsFromAnyone]: getBooleanPreferenceValue(
        PreferenceType.MembershipApplicationsFromAnyone
      ),
      [PreferenceType.MembershipJoinSpaceFromAnyone]: getBooleanPreferenceValue(
        PreferenceType.MembershipJoinSpaceFromAnyone
      ),
    };
    const nextPreferences = membershipTruthTable[value];

    for (const [key, value] of Object.entries(currentPreferences)) {
      if (value !== nextPreferences[key]) {
        await handleUpdatePreference(key as SpacePreferenceType, `${nextPreferences[key]}`, false);
      }
    }
    notify(t('pages.admin.space.settings.savedSuccessfully'), 'success');
  };

  return (
    <PageContent background="transparent">
      {!loading && (
        <>
          <PageContentBlock>
            <BlockTitle>{t('pages.admin.space.settings.visibility.title')}</BlockTitle>
            <RadioSettingsGroup
              value={getVisibilityValue()}
              options={{
                public: {
                  label: (
                    <Trans i18nKey="pages.admin.space.settings.visibility.public" components={{ b: <strong /> }} />
                  ),
                },
                private: {
                  label: (
                    <Trans i18nKey="pages.admin.space.settings.visibility.private" components={{ b: <strong /> }} />
                  ),
                },
              }}
              onChange={newValue =>
                handleUpdatePreference(
                  SpacePreferenceType.AuthorizationAnonymousReadAccess,
                  newValue === 'public' ? 'true' : 'false'
                )
              }
            />
          </PageContentBlock>

          <PageContentBlock>
            <BlockTitle>{t('pages.admin.space.settings.membership.title')}</BlockTitle>
            <RadioSettingsGroup
              value={getMembershipValue()}
              options={{
                [MembershipOption.noApplicationRequired]: {
                  label: (
                    <Trans
                      i18nKey="pages.admin.space.settings.membership.noApplicationRequired"
                      components={{ b: <strong /> }}
                    />
                  ),
                },
                [MembershipOption.applicationRequired]: {
                  label: (
                    <Trans
                      i18nKey="pages.admin.space.settings.membership.applicationRequired"
                      components={{
                        b: <strong />,
                        community: <RouterLink to={`../${SettingsSection.Community}`} onClick={scrollToTop} />,
                      }}
                    />
                  ),
                },
                [MembershipOption.invitationOnly]: {
                  label: (
                    <Trans
                      i18nKey="pages.admin.space.settings.membership.invitationOnly"
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

            <BlockSectionTitle>{t('pages.admin.space.settings.membership.trustedApplicants')}</BlockSectionTitle>
            <SwitchSettingsGroup
              options={{
                trustHostOrganization: {
                  checked:
                    getBooleanPreferenceValue(PreferenceType.MembershipJoinSpaceFromHostOrganizationMembers) ?? false,
                  label: (
                    <Trans
                      t={t}
                      i18nKey="pages.admin.space.settings.membership.hostOrganizationJoin"
                      values={{
                        host: hostOrganization?.space?.host?.profile?.displayName,
                      }}
                      components={{ b: <strong />, i: <em /> }}
                    />
                  ),
                },
              }}
              onChange={(setting, newValue) => {
                if (setting === 'trustHostOrganization') {
                  return handleUpdatePreference(
                    SpacePreferenceType.MembershipJoinSpaceFromHostOrganizationMembers,
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
            <CommunityApplicationForm spaceId={spaceNameId} />
          </PageContentBlockCollapsible>

          <PageContentBlock>
            <BlockTitle>{t('pages.admin.space.settings.memberActions.title')}</BlockTitle>
            <SwitchSettingsGroup
              options={{
                createBlocks: {
                  checked: getBooleanPreferenceValue(PreferenceType.AllowMembersToCreateCallouts) ?? false,
                  label: (
                    <Trans
                      i18nKey="pages.admin.space.settings.memberActions.createBlocks"
                      components={{ b: <strong /> }}
                    />
                  ),
                },
                createChallenges: {
                  checked: getBooleanPreferenceValue(PreferenceType.AllowMembersToCreateChallenges) ?? false,
                  label: (
                    <Trans
                      i18nKey="pages.admin.space.settings.memberActions.createChallenges"
                      components={{ b: <strong /> }}
                    />
                  ),
                },
              }}
              onChange={async (setting, newValue) => {
                if (setting === 'createBlocks') {
                  await handleUpdatePreference(
                    SpacePreferenceType.AllowMembersToCreateCallouts,
                    newValue ? 'true' : 'false'
                  );
                }
                if (setting === 'createChallenges') {
                  await handleUpdatePreference(
                    SpacePreferenceType.AllowMembersToCreateChallenges,
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

export default SpaceSettingsView;
