import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import HubSettingsLayout from '../../../../domain/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../domain/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../domain/admin/layout/EntitySettings/types';
import HubAuthorizationView from './HubAuthorizationView';
import {
  AuthorizationCredential,
  HubPreferencesQuery,
  HubPreferencesQueryVariables,
  HubPreferenceType,
  UpdatePreferenceOnHubMutationVariables,
} from '../../../../models/graphql-schema';
import { usePreferences } from '../../../../hooks/providers';
import PreferenceSection from '../../../../components/composite/common/PreferenceSection/PreferenceSection';
import { HubPreferencesDocument, UpdatePreferenceOnHubDocument } from '../../../../hooks/generated/graphql';
import { useHub } from '../../../../hooks';
import { SectionSpacer } from '../../../../domain/shared/components/Section/Section';
import { PreferenceTypes } from '../../../../models/preference-types';

interface HubAuthorizationPageProps extends SettingsPageProps {
  resourceId: string | undefined;
}

const authorizationCredential = AuthorizationCredential.HubAdmin;
const selectedGroups = ['Authorization'];

const querySelector = (query: HubPreferencesQuery) => query.hub.preferences;

const HubAuthorizationPage: FC<HubAuthorizationPageProps> = ({ paths, resourceId, routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { hubNameId } = useHub();

  useAppendBreadcrumb(paths, {
    name: t(`common.enums.authorization-credentials.${authorizationCredential}.name` as const),
  });

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
