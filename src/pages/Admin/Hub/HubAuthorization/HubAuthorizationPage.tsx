import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import HubAuthorizationView from './HubAuthorizationView';
import {
  AuthorizationCredential,
  HubPreferencesQuery,
  HubPreferencesQueryVariables,
  HubPreferenceType,
  UpdatePreferenceOnHubMutationVariables,
} from '../../../../models/graphql-schema';
import PreferenceContainer from '../../../../containers/preferences/PreferenceContainer';
import PreferenceSection from '../../../../components/composite/common/PreferenceSection/PreferenceSection';
import { HubPreferencesDocument, UpdatePreferenceOnHubDocument } from '../../../../hooks/generated/graphql';
import { useHub } from '../../../../hooks';
import { SectionSpacer } from '../../../../components/core/Section/Section';
import { PreferenceTypes } from '../../../../models/preference-types';

interface HubAuthorizationPageProps extends SettingsPageProps {
  resourceId: string | undefined;
}

const authorizationCredential = AuthorizationCredential.HubAdmin;
const selectedGroups = ['Authorization'];

const HubAuthorizationPage: FC<HubAuthorizationPageProps> = ({ paths, resourceId, routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { hubNameId } = useHub();

  useAppendBreadcrumb(paths, {
    name: t(`common.enums.authorization-credentials.${authorizationCredential}.name` as const),
  });

  const queryVariables = useMemo<HubPreferencesQueryVariables>(() => ({ hubNameId }), [hubNameId]);
  const querySelector = (query: HubPreferencesQuery) => query.hub.preferences;
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

  return (
    <HubSettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <HubAuthorizationView credential={authorizationCredential} resourceId={resourceId} />
      <SectionSpacer />
      <PreferenceContainer<HubPreferencesQuery, HubPreferencesQueryVariables, UpdatePreferenceOnHubMutationVariables>
        queryDocument={HubPreferencesDocument}
        queryVariables={queryVariables}
        querySelector={querySelector}
        mutationDocument={UpdatePreferenceOnHubDocument}
        mutationVariables={mutationVariables}
        selectedGroups={selectedGroups}
      >
        {({ preferences, loading, submitting, onUpdate }) => {
          return (
            <PreferenceSection
              headerText={t('common.authorization')}
              subHeaderText={t('pages.admin.hub.authorization.preferences.subtitle')}
              preferences={preferences}
              onUpdate={(id, type, value) => onUpdate(type, value)}
              loading={loading}
              submitting={submitting}
            />
          );
        }}
      </PreferenceContainer>
    </HubSettingsLayout>
  );
};

export default HubAuthorizationPage;
