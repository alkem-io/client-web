import {
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromVirtualContributorMutation,
  useSpaceContributionDetailsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName, RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { ContainerChildProps } from '@/core/container/container';
import { VisualName } from '@/domain/common/visual/constants/visuals.constants';
import { getVisualByType } from '@/domain/common/visual/utils/visuals.utils';
import { useUserContext } from '@/domain/community/user/hooks/useUserContext';
import { SpaceHostedItem } from '@/domain/journey/utils/SpaceHostedItem';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { useCallback, useMemo } from 'react';

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
  about: SpaceAboutLightModel;
  roleSetId?: string;
  level: SpaceLevel;
}

const ContributionDetailsContainer = ({ entities, children }: EntityDetailsContainerProps) => {
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
      const { profile } = spaceData.lookup.space.about;
      return {
        about: {
          profile: {
            description: undefined,
            tagline: profile.tagline,
            url: profile.url,
            tagset: profile.tagset,
            displayName: profile.displayName,
            cardBanner: getVisualByType(VisualName.CARD, profile.visuals),
            avatar: getVisualByType(VisualName.CARD, profile.visuals),
          },
        },
        roleSetId: space.community?.roleSet.id,
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
