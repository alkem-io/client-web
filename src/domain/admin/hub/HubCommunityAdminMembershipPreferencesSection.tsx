import React, { FC } from 'react';
import {
  HubPreferencesQuery,
  HubPreferencesQueryVariables,
  HubPreferenceType,
  UpdatePreferenceOnHubMutationVariables,
} from '../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';
import { useHub } from '../../../hooks';
import { PreferenceTypes } from '../../../models/preference-types';
import { usePreferences } from '../../../hooks/providers/preference';
import { HubPreferencesDocument, UpdatePreferenceOnHubDocument } from '../../../hooks/generated/graphql';
import PreferenceSection from '../../../components/composite/common/PreferenceSection/PreferenceSection';

const querySelector = (query: HubPreferencesQuery) => query.hub.preferences;

const selectedGroups = ['MembershipHub'];

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
      type: type as HubPreferenceType,
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
