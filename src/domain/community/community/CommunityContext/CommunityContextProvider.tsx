import React, { FC, useMemo } from 'react';
import { useSpaceCommunityQuery } from '@/core/apollo/generated/apollo-hooks';
import { CommunityContext, CommunityContextValue } from './CommunityContext';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import { useSubSpace } from '../../../journey/subspace/hooks/useSubSpace';
import { useOpportunity } from '../../../journey/opportunity/hooks/useOpportunity';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';

/**
 * @deprecated
 * The idea is to get rid of ContextProviders that sit too high in the tree and fetch data globally for some random consumers.
 * Instead, just fetch the data locally when needed.
 * @param children
 * @constructor
 */
const CommunityContextProvider: FC = ({ children }) => {
  const { spaceId, subSpaceId: challengeId, subSubSpaceId: opportunityId, journeyTypeName } = useRouteResolver();

  const { permissions: spacePermissions } = useSpace();
  const { permissions: challengePermissions } = useSubSpace();
  const { permissions: opportunityPermissions } = useOpportunity();

  const { data: spaceData, loading: isLoadingSpace } = useSpaceCommunityQuery({
    variables: { spaceId: spaceId!, includeDetails: spacePermissions.communityReadAccess },
    errorPolicy: 'all',
    skip: journeyTypeName !== 'space' || !spaceId,
  });

  const { data: challengeData, loading: isLoadingChallenge } = useSpaceCommunityQuery({
    variables: {
      spaceId: challengeId!,
      includeDetails: challengePermissions.canReadCommunity,
    },
    errorPolicy: 'all',
    skip: journeyTypeName !== 'subspace' || !challengeId,
  });

  const { data: opportunityData, loading: isLoadingOpportunity } = useSpaceCommunityQuery({
    variables: {
      spaceId: opportunityId!,
      includeDetails: opportunityPermissions.communityReadAccess,
    },
    errorPolicy: 'all',
    skip: journeyTypeName !== 'subsubspace' || !opportunityId,
  });

  const community =
    spaceData?.lookup.space?.community ??
    challengeData?.lookup.space?.community ??
    opportunityData?.lookup.space?.community;

  const communityName =
    spaceData?.lookup.space?.profile.displayName ??
    challengeData?.lookup.space?.profile.displayName ??
    opportunityData?.lookup.space?.profile.displayName;

  const isLoading = isLoadingSpace || isLoadingChallenge || isLoadingOpportunity;

  const providedValue = useMemo<CommunityContextValue>(
    () => ({
      communityId: community?.id ?? '',
      roleSetId: community?.roleSet?.id ?? '',
      communityName: communityName ?? '',
      communicationId: community?.communication?.id ?? '',
      communicationPrivileges: community?.communication?.authorization?.myPrivileges ?? [],
      loading: isLoading,
      myMembershipStatus: community?.roleSet?.myMembershipStatus,
    }),
    [community, isLoading]
  );

  return <CommunityContext.Provider value={providedValue}>{children}</CommunityContext.Provider>;
};

export default CommunityContextProvider;
