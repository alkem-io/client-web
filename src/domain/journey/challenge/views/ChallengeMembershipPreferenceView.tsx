import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import PreferenceSection from '../../../../main/ui/settings/PreferenceSection';
import { ViewProps } from '../../../../core/container/view';

export interface ChallengeMembershipPreferenceViewEntities {}

export interface ChallengeMembershipPreferenceViewOptions {}

export interface ChallengeMembershipPreferenceViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengeMembershipPreferenceViewProps
  extends ViewProps<
    ChallengeMembershipPreferenceViewEntities,
    ChallengeMembershipPreferenceViewState,
    ChallengeMembershipPreferenceViewOptions
  > {}

const ChallengeMembershipPreferenceView: FC<ChallengeMembershipPreferenceViewProps> = ({
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
      headerText={t('pages.admin.challenge.community.preferences.title')}
      subHeaderText={t('pages.admin.challenge.community.preferences.subtitle')}
      preferences={preferences}
      onUpdate={(id, type, value) => onUpdate(id, type, value)}
      loading={loading}
    />
  );
};

export default ChallengeMembershipPreferenceView;
