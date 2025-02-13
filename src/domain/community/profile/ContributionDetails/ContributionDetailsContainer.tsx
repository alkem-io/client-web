import { PropsWithChildren, useCallback, useMemo } from 'react';
import {
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromVirtualContributorMutation,
  useSpaceContributionDetailsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '@/core/container/container';
import { getVisualByType } from '@/domain/common/visual/utils/visuals.utils';
import { useUserContext } from '@/domain/community/user/hooks/useUserContext';
import { VisualName } from '@/domain/common/visual/constants/visuals.constants';
import { SpaceHostedItem } from '@/domain/journey/utils/SpaceHostedItem';
import { RoleSetContributorType, RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface EntityDetailsContainerEntities {
  details?: ContributionDetails;
}

export interface EntityDetailsContainerState {
  loading: boolean;
  isLeavingCommunity: boolean;
}

export interface EntityDetailsContainerActions {
  leaveCommunity: () => Promise<void>;
}

interface EntityDetailsContainerProps
  extends ContainerChildProps<
    EntityDetailsContainerEntities,
    EntityDetailsContainerActions,
    EntityDetailsContainerState
  > {
  entities: SpaceHostedItem;
}

export interface ContributionDetails {
  displayName: string;
  banner?: {
    uri: string;
    alternativeText?: string;
  };
  tags: string[];
  url: string;
  roleSetId?: string;
  tagline: string;
  level: SpaceLevel;
}

const ContributionDetailsContainer = ({ entities, children }: PropsWithChildren<EntityDetailsContainerProps>) => {
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
        displayName: space.profile.displayName!,
        banner: getVisualByType(VisualName.CARD, space.profile.visuals),
        tags: space.profile.tagset?.tags ?? [],
        url: space.profile.url,
        communityId: space.community?.id,
        roleSetId: space.community?.roleSet.id,
        tagline: space.profile.tagline ?? '',
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

  return (
    <>
      {children(
        { details },
        {
          loading: spaceLoading,
          isLeavingCommunity: userIsLeavingCommunity || vcIsLeavingCommunity,
        },
        { leaveCommunity: handleLeaveCommunity }
      )}
    </>
  );
};

export default ContributionDetailsContainer;
