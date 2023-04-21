import { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  useChallengeExplorerDataQuery,
  useChallengeExplorerPageQuery,
  useChallengeExplorerSearchQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../community/contributor/user';
import { ValueType } from '../../../../common/components/core/card-filter/filterFn';
import { getVisualBannerNarrow, getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { HubVisibility, SearchResultChallengeFragment } from '../../../../core/apollo/generated/graphql-schema';
import { SearchResultT } from '../../../platform/search/SearchView';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

export type SimpleChallenge = {
  id: string;
  nameID: string;
  hubId: string;
  hubNameId: string;
  hubDisplayName: string;
  hubTagline: string;
  hubVisibility: HubVisibility;
  displayName: string;
  tagline: string;
  imageUrl: string | undefined;
  imageAltText: string | undefined;
  tags: string[];
  roles: string[];
  vision: string;
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
  const { user: userMetadata, isAuthenticated, loading: loadingUser } = useUserContext();

  // PRIVATE: Challenges if the user is logged in
  const {
    data: userChallenges,
    loading: loadingUserData,
    error,
  } = useChallengeExplorerPageQuery({
    variables: {
      userID: userMetadata?.user?.id || '',
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
        hubDisplayName: hub.profile.displayName,
        hubVisibility: hub.visibility,
        hubTagline: hub.profile.tagline || '',
        displayName: ch.profile.displayName,
        imageUrl: getVisualBannerNarrow(ch.profile.visuals),
        imageAltText: getVisualByType(VisualName.BANNER, ch.profile?.visuals)?.alternativeText,
        tagline: ch.profile.tagline || '',
        tags: ch.profile.tagset?.tags || [],
        roles: challengeRoles.find(c => c.id === ch.id)?.roles || [],
        vision: ch.context?.vision || '',
      })) || []
  );

  const myChallenges = allChallengesInMyHubs?.filter(ch => myChallengesIDs?.includes(ch.id));
  const otherChallenges = allChallengesInMyHubs?.filter(ch => !myChallengesIDs?.includes(ch.id));

  // PUBLIC: Search for challenges
  const { data: rawSearchResults, loading: loadingSearchResults } = useChallengeExplorerSearchQuery({
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
    rawSearchResults?.search?.journeyResults.flatMap(result => {
      const entry = result as SearchResultT<SearchResultChallengeFragment>;
      const ch = entry.challenge;
      const hub = entry.hub;
      return {
        id: ch.id,
        nameID: ch.nameID,
        hubId: hub.id,
        hubNameId: hub.nameID,
        hubDisplayName: hub.profile.displayName,
        hubTagline: hub.profile.tagline || '',
        hubVisibility: hub.visibility,
        displayName: ch.profile.displayName,
        imageUrl: getVisualBannerNarrow(ch.profile.visuals),
        imageAltText: getVisualByType(VisualName.BANNER, ch.profile?.visuals)?.alternativeText,
        tagline: ch.profile.tagline || '',
        tags: ch.profile.tagset?.tags || [],
        roles: challengeRoles.find(c => c.id === ch.id)?.roles || [],
        vision: ch.context?.vision || '',
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
