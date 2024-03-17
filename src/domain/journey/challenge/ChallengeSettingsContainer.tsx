import React, { FC, useCallback } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../core/container/container';
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
  spaceId: string;
  challengeId: string;
}

const excludedPreferences = [PreferenceType.MembershipFeedbackOnChallengeContext];

const ChallengePreferenceContainer: FC<ChallengePreferenceContainerProps> = ({ children, spaceId, challengeId }) => {
  const { data, loading, error } = useChallengePreferencesQuery({
    variables: { spaceNameId: spaceId, challengeNameId: challengeId },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    skip: !spaceId,
  });

  const [updatePreference] = useUpdatePreferenceOnChallengeMutation({});

  const preferences = (data?.space?.challenge?.preferences ?? []).filter(
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
