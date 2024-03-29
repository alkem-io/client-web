import React, { FC, useMemo } from 'react';
import {
  useChallengeCommunityQuery,
  useSpaceCommunityQuery,
  useOpportunityCommunityQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { CommunityContext, CommunityContextValue } from './CommunityContext';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import { useChallenge } from '../../../journey/challenge/hooks/useChallenge';
import { useOpportunity } from '../../../journey/opportunity/hooks/useOpportunity';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

/**
 * @deprecated
 * The idea is to get rid of ContextProviders that sit too high in the tree and fetch data globally for some random consumers.
 * Instead, just fetch the data locally when needed.
 * @param children
 * @constructor
 */
const CommunityContextProvider: FC = ({ children }) => {
  const { spaceId, challengeId, opportunityId, journeyTypeName } = useRouteResolver();

  const { permissions: spacePermissions } = useSpace();
  const { permissions: challengePermissions } = useChallenge();
  const { permissions: opportunityPermissions } = useOpportunity();

  const { data: spaceData, loading: isLoadingSpace } = useSpaceCommunityQuery({
    variables: { spaceId: spaceId!, includeDetails: spacePermissions.communityReadAccess },
    errorPolicy: 'all',
    skip: journeyTypeName !== 'space' || !spaceId,
  });

  const { data: challengeData, loading: isLoadingChallenge } = useChallengeCommunityQuery({
    variables: {
      challengeId: challengeId!,
      includeDetails: challengePermissions.canReadCommunity,
    },
    errorPolicy: 'all',
    skip: journeyTypeName !== 'challenge' || !challengeId,
  });

  const { data: opportunityData, loading: isLoadingOpportunity } = useOpportunityCommunityQuery({
    variables: {
      opportunityId: opportunityId!,
      includeDetails: opportunityPermissions.communityReadAccess,
    },
    errorPolicy: 'all',
    skip: journeyTypeName !== 'opportunity' || !opportunityId,
  });

  const community =
    spaceData?.space.community ??
    challengeData?.lookup.challenge?.community ??
    opportunityData?.lookup.opportunity?.community;

  const communityName =
    spaceData?.space.profile.displayName ??
    challengeData?.lookup.challenge?.profile.displayName ??
    opportunityData?.lookup.opportunity?.profile.displayName;

  const isLoading = isLoadingSpace || isLoadingChallenge || isLoadingOpportunity;

  const providedValue = useMemo<CommunityContextValue>(
    () => ({
      communityId: community?.id ?? '',
      communityName: communityName ?? '',
      communicationId: community?.communication?.id ?? '',
      communicationPrivileges: community?.communication?.authorization?.myPrivileges ?? [],
      loading: isLoading,
      myMembershipStatus: community?.myMembershipStatus,
    }),
    [community, isLoading]
  );

  return <CommunityContext.Provider value={providedValue}>{children}</CommunityContext.Provider>;
};

export default CommunityContextProvider;
