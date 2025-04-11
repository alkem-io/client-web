import { useCallback, useMemo } from 'react';
import { RoleName, RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model.';
import { useUserContext } from '@/domain/community/user';
import {
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromVirtualContributorMutation,
  useSpaceContributionDetailsQuery,
} from '@/core/apollo/generated/apollo-hooks';

export interface ContributionDetails {
  about: SpaceAboutLightModel;
  roleSetId?: string;
  level: SpaceLevel;
}

interface UseContributionParams {
  spaceHostedItem: SpaceHostedItem;
}

export interface UseContributionProvided {
  details?: ContributionDetails;
  leaveCommunity: () => Promise<void>;
  loading: boolean;
  isLeavingCommunity: boolean;
}

const useContributionProvider = ({ spaceHostedItem: entities }: UseContributionParams): UseContributionProvided => {
  const { spaceID, spaceLevel, contributorType, contributorId } = entities;
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user?.id;
  const { data: spaceData, loading: spaceLoading } = useSpaceContributionDetailsQuery({
    variables: {
      spaceId: spaceID,
    },
  });

  const [userLeaveCommunity, { loading: userIsLeavingCommunity }] = useRemoveRoleFromUserMutation();
  const [vcLeaveCommunity, { loading: vcIsLeavingCommunity }] = useRemoveRoleFromVirtualContributorMutation();

  const details = useMemo<ContributionDetails | undefined>(() => {
    if (spaceData?.lookup.space) {
      const space = spaceData.lookup.space;
      return {
        about: space.about,
        roleSetId: space.about.membership.roleSetID,
        level: space.level,
      };
    }
  }, [spaceData, spaceLevel]);

  const handleLeaveCommunity = useCallback(async () => {
    switch (contributorType) {
      case RoleSetContributorType.User: {
        if (details?.roleSetId && userId) {
          await userLeaveCommunity({
            variables: {
              contributorId: userId,
              roleSetId: details.roleSetId,
              role: RoleName.Member,
            },
            awaitRefetchQueries: true,
          });
        }
        break;
      }
      case RoleSetContributorType.Virtual: {
        if (details?.roleSetId && contributorId) {
          await vcLeaveCommunity({
            variables: {
              contributorId: contributorId,
              roleSetId: details.roleSetId,
              role: RoleName.Member,
            },
          });
        }
        break;
      }
      default: {
        throw new Error('Invalid contributor type');
      }
    }
  }, [userId, contributorId, contributorType, details?.roleSetId, userLeaveCommunity, vcLeaveCommunity]);

  return {
    details,
    loading: spaceLoading,
    isLeavingCommunity: userIsLeavingCommunity || vcIsLeavingCommunity,
    leaveCommunity: handleLeaveCommunity,
  };
};

export default useContributionProvider;
