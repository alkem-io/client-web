import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useChallengeCommunityQuery,
  useSpaceCommunityQuery,
  useOpportunityCommunityQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { CommunityContext, CommunityContextValue } from './CommunityContext';
import { useSpace } from '../../../challenge/space/SpaceContext/useSpace';
import { useChallenge } from '../../../challenge/challenge/hooks/useChallenge';
import { useOpportunity } from '../../../challenge/opportunity/hooks/useOpportunity';

/**
 * @deprecated
 * The idea is to get rid of ContextProviders that sit too high in the tree and fetch data globally for some random consumers.
 * Instead, just fetch the data locally when needed.
 * @param children
 * @constructor
 */
const CommunityContextProvider: FC = ({ children }) => {
  const { spaceNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();

  const { permissions: spacePermissions } = useSpace();
  const { permissions: challengePermissions } = useChallenge();
  const { permissions: opportunityPermissions } = useOpportunity();

  const { data: spaceData, loading: loadingSpace } = useSpaceCommunityQuery({
    variables: { spaceId: spaceNameId, includeDetails: spacePermissions.communityReadAccess },
    errorPolicy: 'all',
    skip: !spaceNameId || Boolean(challengeNameId) || Boolean(opportunityNameId),
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCommunityQuery({
    variables: {
      spaceId: spaceNameId,
      challengeId: challengeNameId,
      includeDetails: challengePermissions.canReadCommunity,
    },
    errorPolicy: 'all',
    skip: !spaceNameId || !challengeNameId || Boolean(opportunityNameId),
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCommunityQuery({
    variables: {
      spaceId: spaceNameId,
      opportunityId: opportunityNameId,
      includeDetails: opportunityPermissions.communityReadAccess,
    },
    errorPolicy: 'all',
    skip: !spaceNameId || !opportunityNameId,
  });

  const community =
    spaceData?.space.community ??
    challengeData?.space.challenge.community ??
    opportunityData?.space.opportunity.community;

  const communityName =
    spaceData?.space.profile.displayName ??
    challengeData?.space.challenge.profile.displayName ??
    opportunityData?.space.opportunity.profile.displayName;

  const isLoading = loadingSpace || loadingChallenge || loadingOpportunity;

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
