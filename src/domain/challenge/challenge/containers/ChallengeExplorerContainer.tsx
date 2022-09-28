import { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../../models/container';
import { ChallengeExplorerSearchResultFragment, SimpleHubResultEntryFragment } from '../../../../models/graphql-schema';
import { useChallengeExplorerPageQuery, useChallengeExplorerSearchQuery } from '../../../../hooks/generated/graphql';
import { useApolloErrorHandler, useUserContext } from '../../../../hooks';

export type SimpleChallenge = {
  id: string;
  hubId: string;
  hubNameId: string;
  hubDisplayName: string;
  displayName: string;
  roles: string[];
};

export interface ChallengeExplorerContainerEntities {
  isLoggedIn: boolean;
  searchTerms: string[];
  userChallenges?: SimpleChallenge[];
  userHubs?: SimpleHubResultEntryFragment[];
  searchResults?: ChallengeExplorerSearchResultFragment[];
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
  const isLoggedIn = !!user;

  const { data, loading, error } = useChallengeExplorerPageQuery({
    onError: handleError,
    variables: {
      rolesData: {
        userID: user?.id || '',
      },
    },
    skip: !isLoggedIn,
  });

  const hubs = data?.rolesUser.hubs;
  const userChallenges: SimpleChallenge[] | undefined =
    hubs &&
    hubs.flatMap(hub =>
      hub?.challenges.map(challenge => ({
        id: challenge.id,
        hubNameId: hub.nameID,
        hubDisplayName: hub.displayName,
        hubId: hub.hubID,
        displayName: challenge.displayName,
        roles: challenge.roles,
      }))
    );

  const userHubs: SimpleHubResultEntryFragment[] | undefined =
    hubs &&
    hubs.map(({ hubID, displayName, nameID }) => ({
      hubID,
      displayName,
      nameID,
    }));

  // Search
  const { data: searchData } = useChallengeExplorerSearchQuery({
    onError: handleError,
    variables: {
      searchData: {
        terms: searchTerms,
        tagsetNames: ['skills', 'keywords'],
        typesFilter: ['challenge'],
      },
    },
    fetchPolicy: 'no-cache',
    skip: !searchTerms.length,
  });

  const searchResults = (searchData?.search ?? []).map(x => x.result as ChallengeExplorerSearchResultFragment);

  const provided = {
    isLoggedIn,
    searchTerms,
    userChallenges,
    userHubs,
    searchResults,
  };

  return <>{children(provided, { loading, error }, {})}</>;
};
