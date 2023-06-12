import React, { FC } from 'react';
import {
  HubPreferencesQuery,
  HubPreferencesQueryVariables,
  SpacePreferenceType,
  UpdatePreferenceOnHubMutationVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { PreferenceTypes } from '../../../common/preference/preference-types';
import { usePreferences } from '../../../common/preference/usePreferences';
import { HubPreferencesDocument, UpdatePreferenceOnHubDocument } from '../../../../core/apollo/generated/apollo-hooks';
import PreferenceSection from '../../../../common/components/composite/common/PreferenceSection/PreferenceSection';

const querySelector = (query: HubPreferencesQuery) => query.hub.preferences;

const selectedGroups = ['MembershipSpace'];

// TODO migrate to hook+view
export const HubCommunityAdminMembershipPreferencesSection: FC = () => {
  const { t } = useTranslation();
  const { hubNameId } = useHub();

  // todo: how can these two be extracted in a util
  const queryVariables: HubPreferencesQueryVariables = { hubNameId };
  const mutationVariables = (
    queryVariables: HubPreferencesQueryVariables,
    type: PreferenceTypes,
    value: boolean
  ): UpdatePreferenceOnHubMutationVariables => ({
    preferenceData: {
      hubID: hubNameId,
      type: type as SpacePreferenceType,
      value: value ? 'true' : 'false',
    },
  });

  const { preferences, onUpdate, loading, submitting } = usePreferences<
    HubPreferencesQuery,
    HubPreferencesQueryVariables,
    UpdatePreferenceOnHubMutationVariables
  >(
    HubPreferencesDocument,
    queryVariables,
    querySelector,
    UpdatePreferenceOnHubDocument,
    mutationVariables,
    selectedGroups
  );

  return (
    <PreferenceSection
      headerText={t('common.membership')}
      subHeaderText={t('pages.admin.hub.community.preferences.subtitle')}
      preferences={preferences}
      onUpdate={(id, type, value) => onUpdate(type, value)}
      loading={loading}
      submitting={submitting}
    />
  );
};
