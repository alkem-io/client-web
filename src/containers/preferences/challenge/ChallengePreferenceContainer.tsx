import React, { FC, useCallback } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../core/container/container';
import { useApolloErrorHandler } from '../../../hooks';
import {
  useChallengePreferencesQuery,
  useUpdatePreferenceOnChallengeMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import { ChallengePreferenceType, Preference, PreferenceType } from '../../../core/apollo/generated/graphql-schema';

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
  hubId: string;
  challengeId: string;
}

const excludedPreferences = [PreferenceType.MembershipFeedbackOnChallengeContext];

const ChallengePreferenceContainer: FC<ChallengePreferenceContainerProps> = ({ children, hubId, challengeId }) => {
  const handleError = useApolloErrorHandler();

  const { data, loading, error } = useChallengePreferencesQuery({
    variables: { hubNameId: hubId, challengeNameId: challengeId },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    skip: !hubId,
  });

  const [updatePreference] = useUpdatePreferenceOnChallengeMutation({
    onError: handleError,
  });

  const preferences = (data?.hub?.challenge?.preferences ?? []).filter(
    p => !excludedPreferences.includes(p.definition.type)
  );

  const onUpdate = useCallback(
    (id: string, type: ChallengePreferenceType, checked: boolean) => {
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
