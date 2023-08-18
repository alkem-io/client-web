import { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../core/container/container';
import {
  useChallengeExplorerDataQuery,
  useChallengeExplorerPageQuery,
  useChallengeExplorerSearchQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../domain/community/user';
import { ValueType } from '../../../core/utils/filtering/filterFn';
import { getVisualByType } from '../../../domain/common/visual/utils/visuals.utils';
import { SpaceVisibility, SearchResultChallengeFragment } from '../../../core/apollo/generated/graphql-schema';
import { SearchResultT } from '../../../domain/platform/search/SearchView';
import { VisualName } from '../../../domain/common/visual/constants/visuals.constants';

export type SimpleChallenge = {
  id: string;
  nameID: string;
  spaceId: string;
  spaceNameId: string;
  spaceDisplayName: string;
  spaceTagline: string;
  spaceVisibility: SpaceVisibility;
  displayName: string;
  tagline: string;
  banner?: {
    uri: string;
    alternativeText?: string;
  };
  tags: string[];
  roles: string[];
  vision: string;
};

export type SimpleChallengeWithSearchTerms = SimpleChallenge & { matchedTerms: string[] };

export const simpleChallengeValueGetter = (c: SimpleChallenge): ValueType => ({
  id: c.id,
  values: [c.displayName, c.tagline, c.spaceDisplayName, ...c.tags],
});

export const simpleChallengeTagsValueGetter = (c: SimpleChallenge): string[] => c.tags;

export const simpleChallengeSpaceDataGetter = (c: SimpleChallenge) => ({
  id: c.spaceId,
  nameId: c.spaceNameId,
  displayName: c.spaceDisplayName,
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

  const spaceIDs = userChallenges?.rolesUser.spaces.map(space => space.id) || [];
  const myChallengesIDs = userChallenges?.rolesUser.spaces.flatMap(space =>
    space.challenges.map(challenge => challenge.id)
  );
  const challengeRoles =
    userChallenges?.rolesUser.spaces.flatMap(space =>
      space.challenges.map(challenge => ({ id: challenge.id, roles: challenge.roles }))
    ) || [];

  const { data: challengeData, loading: loadingChallengeData } = useChallengeExplorerDataQuery({
    variables: {
      spaceIDs,
    },
    skip: !spaceIDs?.length,
  });

  // With both the userChallenges loaded from the roles query and the challengeData loaded from a spaces query
  // build the output data arrays:
  const allChallengesInMySpaces: SimpleChallenge[] | undefined = challengeData?.spaces?.flatMap(
    space =>
      space.challenges?.map<SimpleChallenge>(ch => ({
        id: ch.id,
        nameID: ch.nameID,
        spaceId: space.id,
        spaceNameId: space.nameID,
        spaceDisplayName: space.profile.displayName,
        spaceVisibility: space.visibility,
        spaceTagline: space.profile.tagline || '',
        displayName: ch.profile.displayName,
        banner: getVisualByType(VisualName.BANNERNARROW, ch.profile.visuals),
        tagline: ch.profile.tagline || '',
        tags: ch.profile.tagset?.tags || [],
        roles: challengeRoles.find(c => c.id === ch.id)?.roles || [],
        vision: ch.context?.vision || '',
      })) || []
  );

  const myChallenges = allChallengesInMySpaces?.filter(ch => myChallengesIDs?.includes(ch.id));
  const otherChallenges = allChallengesInMySpaces?.filter(ch => !myChallengesIDs?.includes(ch.id));

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
      const space = entry.space;
      return {
        id: ch.id,
        nameID: ch.nameID,
        spaceId: space.id,
        spaceNameId: space.nameID,
        spaceDisplayName: space.profile.displayName,
        spaceTagline: space.profile.tagline || '',
        spaceVisibility: space.visibility,
        displayName: ch.profile.displayName,
        banner: getVisualByType(VisualName.BANNERNARROW, ch.profile.visuals),
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
