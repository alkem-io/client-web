import React, { FC, useCallback } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  useChallengePreferencesQuery,
  useUpdatePreferenceOnChallengeMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ChallengePreferenceType, Preference, PreferenceType } from '../../../../core/apollo/generated/graphql-schema';

export interface ChallengePreferenceContainerEntities {
  preferences: Preference[];
}

export interface ChallengePreferenceContainerActions {
  onUpdate: (id: string, type: ChallengePreferenceType, value: boolean) => void;
}

export interface ChallengePreferenceContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengePreferenceContainerProps
  extends ContainerChildProps<
    ChallengePreferenceContainerEntities,
    ChallengePreferenceContainerActions,
    ChallengePreferenceContainerState
  > {
  challengeId: string | undefined;
}

const excludedPreferences = [PreferenceType.MembershipFeedbackOnChallengeContext];

const ChallengePreferenceContainer: FC<ChallengePreferenceContainerProps> = ({ children, challengeId }) => {
  const { data, loading, error } = useChallengePreferencesQuery({
    variables: { challengeId: challengeId! },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    skip: !challengeId,
  });

  const [updatePreference] = useUpdatePreferenceOnChallengeMutation({});

  const preferences = (data?.lookup.challenge?.preferences ?? []).filter(
    p => !excludedPreferences.includes(p.definition.type)
  );

  const onUpdate = useCallback(
    (id: string, type: ChallengePreferenceType, checked: boolean) => {
      if (!challengeId) {
        throw new Error('Challenge ID is required for updating challenge preferences');
      }
      updatePreference({
        variables: {
          preferenceData: {
            challengeID: challengeId,
            type,
            value: checked ? 'true' : 'false',
          },
        },
        optimisticResponse: {
          updatePreferenceOnChallenge: {
            __typename: 'Preference',
            id,
            value: checked ? 'true' : 'false',
          },
        },
      });
    },
    [challengeId, updatePreference]
  );

  return <>{children({ preferences }, { loading, error }, { onUpdate })}</>;
};

export default ChallengePreferenceContainer;
