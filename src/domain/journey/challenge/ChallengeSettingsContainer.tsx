import React, { FC, useCallback } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../core/container/container';
import {
  CommunityMembershipPolicy,
  SpacePrivacyMode,
  SpaceSettings,
} from '../../../core/apollo/generated/graphql-schema';
import {
  useChallengeSettingsQuery,
  useUpdateChallengeSettingsMutation,
} from '../../../core/apollo/generated/apollo-hooks';

export interface ChallengeSettingsContainerEntities {
  settings: SpaceSettings; // TODO: create model
}

export interface ChallengeSettingsContainerActions {
  onUpdate: () => {};
}

export interface ChallengeSettingsContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengeSettingsContainerProps
  extends ContainerChildProps<
    ChallengeSettingsContainerEntities,
    ChallengeSettingsContainerActions,
    ChallengeSettingsContainerState
  > {
  challengeId: string | undefined;
}

const ChallengeSettingsContainer: FC<ChallengeSettingsContainerProps> = ({ children, challengeId }) => {
  const { data: settingsData, loading } = useChallengeSettingsQuery({
    variables: {
      challengeId: challengeId || '',
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    skip: !challengeId,
  });

  const [updateSpaceSettings] = useUpdateChallengeSettingsMutation();

  const settings = settingsData?.lookup.challenge?.settings;

  const onUpdate = useCallback(
    (
      privacyModeUpdate?: SpacePrivacyMode,
      membershipPolicyUpdate?: CommunityMembershipPolicy,
      hostOrgTrustedUpdate?: boolean
    ) => {
      if (!challengeId) {
        throw new Error('Challenge ID is required for updating challenge preferences');
      }
      const privacyMode = privacyModeUpdate ? privacyModeUpdate : settings?.privacy.mode ?? SpacePrivacyMode.Public;
      const membershipPolicy =
        membershipPolicyUpdate ?? settings?.membership.policy ?? CommunityMembershipPolicy.Invitations;
      const hostOrgArray = settings?.membership.trustedOrganizations ?? [];
      const hostOrgTrusted = hostOrgTrustedUpdate ?? hostOrgArray.length > 0;
      updateSpaceSettings({
        variables: {
          settingsData: {
            challengeID: challengeId,
            settings: {
              privacy: {
                mode: privacyMode,
              },
              membership: {
                policy: membershipPolicy,
                trustedOrganizations: hostOrgTrusted ? ['myHostOrgID-TODO'] : [],
              },
              collaboration: {
                allowMembersToCreateCallouts: true,
                allowMembersToCreateSubspaces: true,
                inheritMembershipRights: true,
              },
            },
          },
        },
      });
    }, // Add missing closing parenthesis

    [challengeId] // Replace 'updatePreference' with 'onUpdate'
  );

  return <>{children({ settings }, { loading, error }, { onUpdate })}</>;
};

export default ChallengeSettingsContainer;
