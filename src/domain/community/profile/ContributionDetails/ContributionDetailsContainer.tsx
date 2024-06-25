import React, { FC, useCallback, useMemo } from 'react';
import {
  useRemoveUserAsCommunityMemberMutation,
  useRemoveVirtualContributorAsCommunityMemberMutation,
  useSpaceContributionDetailsQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { useUserContext } from '../../user/hooks/useUserContext';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';
import { CommunityContributorType } from '../../../../core/apollo/generated/graphql-schema';

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
  communityId?: string;
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

  const [userLeaveCommunity, { loading: userIsLeavingCommunity }] = useRemoveUserAsCommunityMemberMutation();
  const [vcLeaveCommunity, { loading: vcIsLeavingCommunity }] = useRemoveVirtualContributorAsCommunityMemberMutation();

  const details = useMemo<ContributionDetails | undefined>(() => {
    if (spaceData?.lookup.space) {
      const space = spaceData.lookup.space;
      return {
        displayName: space.profile.displayName!,
        journeyTypeName: ['space', 'subspace', 'subsubspace'][spaceLevel] as JourneyTypeName,
        banner: getVisualByType(VisualName.CARD, space.profile.visuals),
        tags: space.profile.tagset?.tags ?? [],
        journeyUri: space.profile.url,
        communityId: space.community?.id,
        tagline: space.profile.tagline ?? '',
      };
    }
  }, [spaceData, spaceLevel]);

  const handleLeaveCommunity = useCallback(async () => {
    switch (contributorType) {
      case CommunityContributorType.User: {
        if (details?.communityId && userId) {
          await userLeaveCommunity({
            variables: {
              memberId: userId,
              communityId: details.communityId,
            },
            awaitRefetchQueries: true,
          });
        }
        break;
      }
      case CommunityContributorType.Virtual: {
        if (details?.communityId && contributorId) {
          await vcLeaveCommunity({
            variables: {
              memberId: contributorId,
              communityId: details.communityId,
            },
          });
        }
        break;
      }
      default: {
        throw new Error('Invalid contributor type');
      }
    }
  }, [userId, contributorId, contributorType, details?.communityId, userLeaveCommunity, vcLeaveCommunity]);

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
