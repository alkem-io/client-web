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
  displayName: string;
  tagline: string;
  imageUrl: string | undefined;
  tags: string[];
  roles: string[];
};

export const simpleChallengeValueGetter = (c: SimpleChallenge): ValueType => ({
  id: c.id,
  values: [c.displayName, c.tagline, c.hubDisplayName, ...c.tags],
});

export const simpleChallengeTagsValueGetter = (c: SimpleChallenge): string[] => c.tags;

export interface ChallengeExplorerContainerEntities {
  isLoggedIn: boolean;
  searchTerms: string[];
  myChallenges?: SimpleChallenge[];
  otherChallenges?: SimpleChallenge[];
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
  const { user: userMetadata, loading: loadingUser } = useUserContext();
  const user = userMetadata?.user;
  const isLoggedIn = !!user;

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
    skip: !isLoggedIn,
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
        displayName: ch.displayName,
        imageUrl: getVisualBannerNarrow(ch.context?.visuals),
        tagline: ch.context?.tagline || '',
        tags: ch.tagset?.tags || [],
        roles: challengeRoles.find(c => c.id === ch.id)?.roles || [],
      })) || []
  );

  const myChallenges = allChallengesInMyHubs?.filter(ch => myChallengesIDs?.includes(ch.id));
  const otherChallenges = allChallengesInMyHubs?.filter(ch => !myChallengesIDs?.includes(ch.id));

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
    myChallenges,
    otherChallenges,
    searchResults,
  };

  const loading = loadingUser || loadingUserData || loadingChallengeData;

  return <>{children(provided, { loading, error }, {})}</>;
};
