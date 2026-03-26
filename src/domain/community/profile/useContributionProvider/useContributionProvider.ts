import {
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromVirtualContributorMutation,
  useSpaceContributionDetailsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { ActorType, RoleName, type SpaceLevel, type SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import type { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';

export interface ContributionDetails {
  id: string;
  about: SpaceAboutLightModel;
  roleSetId?: string;
  level: SpaceLevel;
  visibility: SpaceVisibility;
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
  const { spaceID, contributorType, contributorId } = entities;
  const { userModel: currentUser } = useCurrentUserContext();
  const userId = currentUser?.id;
  const { data: spaceData, loading: spaceLoading } = useSpaceContributionDetailsQuery({
    variables: {
      spaceId: spaceID,
    },
  });

  const [userLeaveCommunity, { loading: userIsLeavingCommunity }] = useRemoveRoleFromUserMutation();
  const [vcLeaveCommunity, { loading: vcIsLeavingCommunity }] = useRemoveRoleFromVirtualContributorMutation();

  const details = (() => {
    if (spaceData?.lookup.space) {
      const space = spaceData.lookup.space;
      return {
        id: space.id,
        about: space.about,
        roleSetId: space.about.membership.roleSetID,
        level: space.level,
        visibility: space.visibility,
      };
    }
  })();

  const handleLeaveCommunity = async () => {
    switch (contributorType) {
      case ActorType.User: {
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
      case ActorType.VirtualContributor: {
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
  };

  return {
    details,
    loading: spaceLoading,
    isLeavingCommunity: userIsLeavingCommunity || vcIsLeavingCommunity,
    leaveCommunity: handleLeaveCommunity,
  };
};

export default useContributionProvider;
