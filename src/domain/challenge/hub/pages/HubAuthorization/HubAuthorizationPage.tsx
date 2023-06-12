import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import HubAuthorizationView from './HubAuthorizationView';
import {
  AuthorizationCredential,
  HubPreferencesQuery,
  HubPreferencesQueryVariables,
  SpacePreferenceType,
  UpdatePreferenceOnHubMutationVariables,
} from '../../../../../core/apollo/generated/graphql-schema';
import { usePreferences } from '../../../../common/preference/usePreferences';
import PreferenceSection from '../../../../../common/components/composite/common/PreferenceSection/PreferenceSection';
import {
  HubPreferencesDocument,
  UpdatePreferenceOnHubDocument,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useHub } from '../../HubContext/useHub';
import { SectionSpacer } from '../../../../shared/components/Section/Section';
import { PreferenceTypes } from '../../../../common/preference/preference-types';

interface HubAuthorizationPageProps extends SettingsPageProps {
  resourceId: string | undefined;
}

const authorizationCredential = AuthorizationCredential.HubAdmin;
const selectedGroups = ['Authorization', 'Privileges'];

const querySelector = (query: HubPreferencesQuery) => query.hub.preferences;

const HubAuthorizationPage: FC<HubAuthorizationPageProps> = ({ resourceId, routePrefix = '../' }) => {
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
    <HubSettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <HubAuthorizationView credential={authorizationCredential} resourceId={resourceId} />
      <SectionSpacer />
      <PreferenceSection
        headerText={t('common.authorization')}
        subHeaderText={t('pages.admin.hub.authorization.preferences.subtitle')}
        preferences={preferences}
        onUpdate={(id, type, value) => onUpdate(type, value)}
        loading={loading}
        submitting={submitting}
      />
    </HubSettingsLayout>
  );
};

export default HubAuthorizationPage;
