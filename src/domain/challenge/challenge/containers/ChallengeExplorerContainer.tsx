import { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../../models/container';
import {
  useChallengeExplorerDataQuery,
  useChallengeExplorerPageQuery,
  useChallengeExplorerSearchQuery,
} from '../../../../hooks/generated/graphql';
import { useApolloErrorHandler, useUserContext } from '../../../../hooks';
import { ValueType } from '../../../../common/components/core/card-filter/filterFn';
import { getVisualBannerNarrow } from '../../../../common/utils/visuals.utils';
import { SearchResultChallengeFragment } from '../../../../models/graphql-schema';
import { SearchResultT } from '../../../../pages/Search/SearchPage';

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
  myChallenges: SimpleChallenge[] | undefined;
  otherChallenges: SimpleChallenge[] | undefined;
  searchResults: SimpleChallengeWithSearchTerms[] | undefined;
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

  // PRIVATE: Challenges if the user is logged in
  const {
    data: userChallenges,
    loading: loadingUserData,
    error,
  } = useChallengeExplorerPageQuery({
    onError: handleError,
    variables: {
      rolesData: {
        userID: userMetadata?.user?.id || '',
      },
    },
    skip: !isAuthenticated || !userMetadata?.user?.id,
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

  const searchResults: SimpleChallengeWithSearchTerms[] | undefined =
    rawSearchResults?.search?.flatMap(result => {
      const entry = result as SearchResultT<SearchResultChallengeFragment>;
      const ch = entry.challenge;
      const hub = entry.hub;
      return {
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
        matchedTerms: entry.terms,
      };
    }) || [];

  const provided = {
    isAuthenticated,
    searchTerms,
    myChallenges,
    otherChallenges,
    searchResults,
  };

  const loading = loadingUser || loadingUserData || loadingChallengeData;
  const loadingSearch = loadingSearchResults;

  return <>{children(provided, { loading, loadingSearch, error }, {})}</>;
};
