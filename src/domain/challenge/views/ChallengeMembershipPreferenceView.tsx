import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import PreferenceSection from '../../../common/components/composite/common/PreferenceSection/PreferenceSection';
import { Preference, ChallengePreferenceType } from '../../../models/graphql-schema';
import { ViewProps } from '../../../models/view';

export interface ChallengeMembershipPreferenceViewEntities {
  preferences: Preference[];
}

export interface ChallengeMembershipPreferenceViewActions {
  onUpdate: (id: string, type: ChallengePreferenceType, value: boolean) => void;
}

export interface ChallengeMembershipPreferenceViewOptions {}

export interface ChallengeMembershipPreferenceViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengeMembershipPreferenceViewProps
  extends ViewProps<
    ChallengeMembershipPreferenceViewEntities,
    ChallengeMembershipPreferenceViewActions,
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
      onUpdate={(id, type, value) => onUpdate(id, type as ChallengePreferenceType, value)}
      loading={loading}
    />
  );
};
export default ChallengeMembershipPreferenceView;
