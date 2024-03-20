import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import {
  ChallengePreferencesQuery,
  ChallengePreferencesQueryVariables,
  ChallengePreferenceType,
  UpdatePreferenceOnChallengeMutationVariables,
} from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import PreferenceSection from '../../../../../main/ui/settings/PreferenceSection';
import { PreferenceTypes } from '../../../../common/preference/preference-types';
import { useChallenge } from '../../hooks/useChallenge';
import { usePreferences } from '../../../../common/preference/usePreferences';
import {
  ChallengePreferencesDocument,
  UpdatePreferenceOnChallengeDocument,
} from '../../../../../core/apollo/generated/apollo-hooks';

const selectedGroups = ['Authorization', 'Privileges'];

const querySelector = (query: ChallengePreferencesQuery) => query.lookup.challenge?.preferences;

interface ChallengeAuthorizationPageProps extends SettingsPageProps {}

const ChallengeAuthorizationPage: FC<ChallengeAuthorizationPageProps> = ({ routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { challengeId } = useChallenge();

  // todo: how can these two be extracted in a util
  const queryVariables: ChallengePreferencesQueryVariables = { challengeId };

  const mutationVariables = (
    queryVariables: ChallengePreferencesQueryVariables,
    type: PreferenceTypes,
    value: boolean
  ): UpdatePreferenceOnChallengeMutationVariables => ({
    preferenceData: {
      challengeID: challengeId,
      type: type as ChallengePreferenceType,
      value: value ? 'true' : 'false',
    },
  });

  const { preferences, onUpdate, loading, submitting } = usePreferences<
    ChallengePreferencesQuery,
    ChallengePreferencesQueryVariables,
    UpdatePreferenceOnChallengeMutationVariables
  >(
    ChallengePreferencesDocument,
    queryVariables,
    querySelector,
    UpdatePreferenceOnChallengeDocument,
    mutationVariables,
    selectedGroups
  );

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <PreferenceSection
        headerText={t('common.authorization')}
        subHeaderText={t('pages.admin.challenge.authorization.preferences.subtitle')}
        preferences={preferences}
        onUpdate={(id, type, value) => onUpdate(type, value)}
        loading={loading}
        submitting={submitting}
      />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeAuthorizationPage;
