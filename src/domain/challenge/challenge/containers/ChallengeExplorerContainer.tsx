import { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../../models/container';
import { SimpleHubResultEntryFragment } from '../../../../models/graphql-schema';
import { useChallengeExplorerPageQuery } from '../../../../hooks/generated/graphql';
import { useApolloErrorHandler, useUserContext } from '../../../../hooks';

export type SimpleChallenge = {
  id: string;
  hubId: string;
  hubNameId: string;
};

export interface ChallengeExplorerContainerEntities {
  isLoggedIn: boolean;
  searchTerms: string[];
  userChallenges?: SimpleChallenge[];
  userHubs?: SimpleHubResultEntryFragment[];
}

export interface ChallengeExplorerContainerActions {}

export interface ChallengeExplorerContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengePageContainerProps
  extends ContainerChildProps<
    ChallengeExplorerContainerEntities,
    ChallengeExplorerContainerActions,
    ChallengeExplorerContainerState
  > {
  searchTerms: string[];
}

export const ChallengeExplorerContainer: FC<ChallengePageContainerProps> = ({ searchTerms, children }) => {
  const handleError = useApolloErrorHandler();
  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const { data, loading, error } = useChallengeExplorerPageQuery({
    onError: handleError,
    variables: {
      rolesData: {
        userID: user?.id || '',
      },
    },
    skip: !user,
  });
  const hubs = data?.rolesUser.hubs;
  const userChallenges: SimpleChallenge[] | undefined =
    hubs &&
    hubs.flatMap(x =>
      x?.challenges.map(y => ({
        id: y.id,
        hubNameId: x.nameID,
        hubId: x.hubID,
      }))
    );

  const userHubs: SimpleHubResultEntryFragment[] | undefined =
    hubs &&
    hubs.map(({ hubID, displayName, nameID }) => ({
      hubID,
      displayName,
      nameID,
    }));

  const provided = {
    isLoggedIn: !!user,
    searchTerms,
    userChallenges,
    userHubs,
  };

  return <>{children(provided, { loading, error }, {})}</>;
};
