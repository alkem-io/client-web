import React, { FC, useCallback, useMemo } from 'react';
import {
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromVirtualContributorMutation,
  useSpaceContributionDetailsQuery,
} from '@core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '@core/container/container';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { useUserContext } from '../../user/hooks/useUserContext';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';
import { CommunityContributorType, CommunityRoleType } from '@core/apollo/generated/graphql-schema';
import { getChildJourneyTypeName } from '../../../shared/utils/spaceLevel';

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
  journeyTypeName: JourneyTypeName;
  banner?: {
    uri: string;
    alternativeText?: string;
  };
  tags: string[];
  journeyUri: string;
  roleSetId?: string;
  tagline: string;
}

const ContributionDetailsContainer: FC<EntityDetailsContainerProps> = ({ entities, children }) => {
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
        journeyTypeName: getChildJourneyTypeName({ level: spaceLevel }) as JourneyTypeName,
        banner: getVisualByType(VisualName.CARD, space.profile.visuals),
        tags: space.profile.tagset?.tags ?? [],
        journeyUri: space.profile.url,
        communityId: space.community?.id,
        roleSetId: space.community?.roleSet.id,
        tagline: space.profile.tagline ?? '',
      };
    }
  }, [spaceData, spaceLevel]);

  const handleLeaveCommunity = useCallback(async () => {
    switch (contributorType) {
      case CommunityContributorType.User: {
        if (details?.roleSetId && userId) {
          await userLeaveCommunity({
            variables: {
              contributorId: userId,
              roleSetId: details.roleSetId,
              role: CommunityRoleType.Member,
            },
            awaitRefetchQueries: true,
          });
        }
        break;
      }
      case CommunityContributorType.Virtual: {
        if (details?.roleSetId && contributorId) {
          await vcLeaveCommunity({
            variables: {
              contributorId: contributorId,
              roleSetId: details.roleSetId,
              role: CommunityRoleType.Member,
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
