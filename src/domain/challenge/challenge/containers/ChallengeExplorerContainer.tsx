import { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../../models/container';
import { ChallengeExplorerSearchResultFragment } from '../../../../models/graphql-schema';
import {
  useChallengeExplorerDataQuery,
  useChallengeExplorerPageQuery,
  useChallengeExplorerSearchQuery,
} from '../../../../hooks/generated/graphql';
import { useApolloErrorHandler, useUserContext } from '../../../../hooks';
import { ValueType } from '../../../../common/components/core/card-filter/filterFn';
import { getVisualBannerNarrow } from '../../../../common/utils/visuals.utils';

export type SimpleChallenge = {
  id: string;
  nameID: string;
  hubId: string;
  hubNameId: string;
  hubDisplayName: string;
  hubTagline: string;
  displayName: string;
  tagline: string;
  imageUrl: string | undefined;
  tags: string[];
  roles: string[];
};

export type SimpleChallengeWithSearchTerms = SimpleChallenge & { matchedTerms: string[] };

export const simpleChallengeValueGetter = (c: SimpleChallenge): ValueType => ({
  id: c.id,
  values: [c.displayName, c.tagline, c.hubDisplayName, ...c.tags],
});

export const simpleChallengeTagsValueGetter = (c: SimpleChallenge): string[] => c.tags;

export const simpleChallengeHubDataGetter = (c: SimpleChallenge) => ({
  id: c.hubId,
  nameId: c.hubNameId,
  displayName: c.hubDisplayName,
});

export interface ChallengeExplorerContainerEntities {
  isAuthenticated: boolean;
  searchTerms: string[];
  myChallenges?: SimpleChallenge[];
  otherChallenges?: SimpleChallenge[];
  searchResults?: SimpleChallengeWithSearchTerms[];
}

export interface ChallengeExplorerContainerActions {}

export interface ChallengeExplorerContainerState {
  loading: boolean;
  loadingSearch: boolean;
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
  const { user: userMetadata, isAuthenticated, loading: loadingUser } = useUserContext();
  const user = userMetadata?.user;

  // PRIVATE: Challenges if the user is logged in
  const {
    data: userChallenges,
    loading: loadingUserData,
    error,
  } = useChallengeExplorerPageQuery({
    onError: handleError,
    variables: {
      rolesData: {
        userID: user?.id || '',
      },
    },
    skip: !isAuthenticated,
  });

  const hubIDs = userChallenges?.rolesUser.hubs.map(hub => hub.id) || [];
  const myChallengesIDs = userChallenges?.rolesUser.hubs.flatMap(hub => hub.challenges.map(challenge => challenge.id));
  const challengeRoles =
    userChallenges?.rolesUser.hubs.flatMap(hub =>
      hub.challenges.map(challenge => ({ id: challenge.id, roles: challenge.roles }))
    ) || [];

  const { data: challengeData, loading: loadingChallengeData } = useChallengeExplorerDataQuery({
    onError: handleError,
    variables: {
      hubIDs,
    },
    skip: !hubIDs?.length,
  });

  // With both the userChallenges loaded from the roles query and the challengeData loaded from a hubs query
  // build the output data arrays:
  const allChallengesInMyHubs: SimpleChallenge[] | undefined = challengeData?.hubs?.flatMap(
    hub =>
      hub.challenges?.map<SimpleChallenge>(ch => ({
        id: ch.id,
        nameID: ch.nameID,
        hubId: hub.id,
        hubNameId: hub.nameID,
        hubDisplayName: hub.displayName,
        hubTagline: hub.context?.tagline || '',
        displayName: ch.displayName,
        imageUrl: getVisualBannerNarrow(ch.context?.visuals),
        tagline: ch.context?.tagline || '',
        tags: ch.tagset?.tags || [],
        roles: challengeRoles.find(c => c.id === ch.id)?.roles || [],
      })) || []
  );

  const myChallenges = allChallengesInMyHubs?.filter(ch => myChallengesIDs?.includes(ch.id));
  const otherChallenges = allChallengesInMyHubs?.filter(ch => !myChallengesIDs?.includes(ch.id));

  // PUBLIC: Search for challenges
  const { data: rawSearchResults, loading: loadingSearchResults } = useChallengeExplorerSearchQuery({
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

  // Obtain the data of the challenges returned by the search
  const hubIDsSearch = rawSearchResults?.search.map(
    result => (result.result as ChallengeExplorerSearchResultFragment)?.hubID
  );
  const challengesIDsSearch = rawSearchResults?.search.map(
    result => (result.result as ChallengeExplorerSearchResultFragment)?.id
  );

  const { data: searchResultsData, loading: loadingSearchResultsData } = useChallengeExplorerDataQuery({
    onError: handleError,
    variables: {
      hubIDs: hubIDsSearch,
      challengeIDs: challengesIDsSearch,
    },
    skip: !hubIDsSearch?.length || !challengesIDsSearch?.length,
  });

  const searchResults: SimpleChallengeWithSearchTerms[] | undefined = searchResultsData?.hubs?.flatMap(
    hub =>
      hub.challenges?.map<SimpleChallengeWithSearchTerms>(ch => ({
        id: ch.id,
        nameID: ch.nameID,
        hubId: hub.id,
        hubNameId: hub.nameID,
        hubDisplayName: hub.displayName,
        hubTagline: hub.context?.tagline || '',
        displayName: ch.displayName,
        imageUrl: getVisualBannerNarrow(ch.context?.visuals),
        tagline: ch.context?.tagline || '',
        tags: ch.tagset?.tags || [],
        roles: challengeRoles.find(c => c.id === ch.id)?.roles || [],
        matchedTerms:
          rawSearchResults?.search.find(r => (r.result as ChallengeExplorerSearchResultFragment)?.id === ch.id)
            ?.terms || [],
      })) || []
  );

  const provided = {
    isAuthenticated,
    searchTerms,
    myChallenges,
    otherChallenges,
    searchResults,
  };

  const loading = loadingUser || loadingUserData || loadingChallengeData;
  const loadingSearch = loadingSearchResults || loadingSearchResultsData;

  return <>{children(provided, { loading, loadingSearch, error }, {})}</>;
};
