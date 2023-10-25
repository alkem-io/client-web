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
import {
  CommunityMembershipStatus,
  SearchResultChallengeFragment,
  SpaceVisibility,
} from '../../../core/apollo/generated/graphql-schema';
import { SearchResultT } from '../../search/SearchView';
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
  member: boolean;
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
    skip: !isAuthenticated || !userMetadata?.user?.id,
  });

  const mySpaceIds = userChallenges?.me.spaceMemberships.map(space => space.id);

  const { data: challengeData, loading: isLoadingChallenge } = useChallengeExplorerDataQuery({
    variables: {
      spaceIDs: mySpaceIds,
    },
    skip: !mySpaceIds?.length,
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
        banner: ch.profile.cardBanner,
        tagline: ch.profile.tagline || '',
        tags: ch.profile.tagset?.tags || [],
        vision: ch.context?.vision || '',
        member: ch.community?.myMembershipStatus === CommunityMembershipStatus.Member,
      })) || []
  );

  const myChallenges = allChallengesInMySpaces?.filter(ch => ch.member);
  const otherChallenges = allChallengesInMySpaces?.filter(ch => !ch.member);

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
        banner: getVisualByType(VisualName.CARD, ch.profile.visuals),
        tagline: ch.profile.tagline || '',
        tags: ch.profile.tagset?.tags || [],
        vision: ch.context?.vision || '',
        matchedTerms: entry.terms,
        member: ch.community?.myMembershipStatus === CommunityMembershipStatus.Member,
      };
    }) || [];

  const provided = {
    isAuthenticated,
    searchTerms,
    myChallenges,
    otherChallenges,
    searchResults,
  };

  const loading = loadingUser || loadingUserData || isLoadingChallenge;
  const loadingSearch = loadingSearchResults;

  return <>{children(provided, { loading, loadingSearch, error }, {})}</>;
};
