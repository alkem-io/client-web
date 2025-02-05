import { FC, useMemo } from 'react';
import { useSpaceCommunityQuery } from '@/core/apollo/generated/apollo-hooks';
import { CommunityContext, CommunityContextValue } from './CommunityContext';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

/**
 * @deprecated
 * The idea is to get rid of ContextProviders that sit too high in the tree and fetch data globally for some random consumers.
 * Instead, just fetch the data locally when needed.
 * @param children
 * @constructor
 */
const CommunityContextProvider: FC = ({ children }) => {
  const { spaceId, spaceLevel } = useUrlResolver();
  const { permissions: spacePermissions } = useSpace();
  const { permissions: subspacePermissions } = useSubSpace();

  const { data: spaceData, loading: isLoadingSpace } = useSpaceCommunityQuery({
    variables: { spaceId: spaceId!, includeDetails: spacePermissions.communityReadAccess },
    errorPolicy: 'all',
    skip: spaceLevel !== SpaceLevel.L0 || !spaceId,
  });

  const { data: challengeData, loading: isLoadingChallenge } = useSpaceCommunityQuery({
    variables: {
      spaceId: spaceId!,
      includeDetails: subspacePermissions.canReadCommunity,
    },
    errorPolicy: 'all',
    skip: spaceLevel === SpaceLevel.L0 || !spaceId,
  });


  const community =
    spaceData?.lookup.space?.community ??
    challengeData?.lookup.space?.community;

  const communityName =
    spaceData?.lookup.space?.profile.displayName ??
    challengeData?.lookup.space?.profile.displayName;

  const isLoading = isLoadingSpace || isLoadingChallenge;

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
