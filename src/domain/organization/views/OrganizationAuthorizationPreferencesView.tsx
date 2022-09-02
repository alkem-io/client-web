import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ViewProps } from '../../../models/view';
import { OrganizationPreferenceType, Preference } from '../../../models/graphql-schema';
import PreferenceSection from '../../../common/components/composite/common/PreferenceSection/PreferenceSection';
import { useTranslation } from 'react-i18next';

export interface OrganizationAuthorizationPreferencesViewEntities {
  preferences: Preference[];
}

export interface OrganizationAuthorizationPreferencesViewActions {
  onUpdate: (id: string, type: OrganizationPreferenceType, value: boolean) => void;
}

export interface OrganizationAuthorizationPreferencesViewOptions {}

export interface OrganizationAuthorizationPreferencesViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface OrganizationAuthorizationPreferencesViewProps
  extends ViewProps<
    OrganizationAuthorizationPreferencesViewEntities,
    OrganizationAuthorizationPreferencesViewActions,
    OrganizationAuthorizationPreferencesViewState,
    OrganizationAuthorizationPreferencesViewOptions
  > {}

const OrganizationAuthorizationPreferencesView: FC<OrganizationAuthorizationPreferencesViewProps> = ({
  entities,
  state,
  actions,
}) => {
  const { t } = useTranslation();
  const { preferences } = entities;
  const { loading } = state;
  const { onUpdate } = actions;
  return (
    <PreferenceSection
      headerText={t('pages.admin.organization.authorization.preferences.title')}
      subHeaderText={t('pages.admin.organization.authorization.preferences.subtitle')}
      preferences={preferences}
      onUpdate={(id, type, value) => onUpdate(id, type as OrganizationPreferenceType, value)}
      loading={loading}
    />
  );
};
export default OrganizationAuthorizationPreferencesView;
