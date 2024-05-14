import React, { FC, useCallback, useMemo } from 'react';
import {
  useRemoveUserAsCommunityMemberMutation,
  useSpaceContributionDetailsQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { useUserContext } from '../../user/hooks/useUserContext';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

export interface EntityDetailsContainerEntities {
  details?: ContributionDetails;
}

export interface EntityDetailsContainerState {
  loading: boolean;
  isLeavingCommunity: boolean;
}

export interface EntityDetailsContainerActions {
  leaveCommunity: () => void;
}

interface EntityDetailsContainerProps
  extends ContainerChildProps<
    EntityDetailsContainerEntities,
    EntityDetailsContainerActions,
    EntityDetailsContainerState
  > {
  entities: {
    spaceId: string;
    challengeId?: string;
    opportunityId?: string;
  };
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
  const { spaceId, challengeId, opportunityId } = entities;
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user?.id;
  const { data: spaceData, loading: spaceLoading } = useSpaceContributionDetailsQuery({
    variables: {
      spaceId: spaceId,
    },
    skip: Boolean(challengeId) || Boolean(opportunityId),
  });

  const { data: challengeData, loading: challengeLoading } = useSpaceContributionDetailsQuery({
    variables: {
      spaceId: challengeId!,
    },
    skip: !challengeId || Boolean(opportunityId),
  });

  const { data: opportunityData, loading: opportunityLoading } = useSpaceContributionDetailsQuery({
    variables: {
      spaceId: opportunityId!,
    },
    skip: !opportunityId,
  });

  const [leaveCommunity, { loading: isLeavingCommunity }] = useRemoveUserAsCommunityMemberMutation();

  const details = useMemo<ContributionDetails | undefined>(() => {
    if (spaceData && spaceData.lookup.space) {
      const space = spaceData.lookup.space;
      return {
        displayName: space.profile.displayName,
        journeyTypeName: 'space',
        banner: getVisualByType(VisualName.CARD, space.profile.visuals),
        tags: space.profile.tagset?.tags ?? [],
        journeyUri: space.profile.url,
        communityId: space.community?.id,
        tagline: space.profile.tagline ?? '',
      };
    }

    if (challengeData && challengeData.lookup.space) {
      const challenge = challengeData.lookup.space;
      return {
        displayName: challenge.profile.displayName!,
        journeyTypeName: 'subspace',
        banner: getVisualByType(VisualName.CARD, challenge.profile.visuals),
        tags: challenge.profile.tagset?.tags ?? [],
        journeyUri: challenge.profile.url!,
        communityId: challenge.community?.id,
        tagline: challenge.profile.tagline ?? '',
      };
    }

    if (opportunityData && opportunityData.lookup.space) {
      const opportunity = opportunityData.lookup.space;
      return {
        displayName: opportunity.profile.displayName!,
        journeyTypeName: 'subsubspace',
        banner: getVisualByType(VisualName.CARD, opportunity.profile.visuals),
        tags: opportunity.profile.tagset?.tags ?? [],
        journeyUri: opportunity.profile.url!,
        communityId: opportunity.community?.id,
        tagline: opportunity.profile.tagline ?? '',
      };
    }
  }, [spaceData, challengeData, opportunityData]);

  const handleLeaveCommunity = useCallback(async () => {
    if (details?.communityId && userId)
      await leaveCommunity({
        variables: {
          memberId: userId,
          communityId: details?.communityId,
        },
        awaitRefetchQueries: true,
      });
  }, [userId, details?.communityId, leaveCommunity]);

  return (
    <>
      {children(
        { details },
        {
          loading: spaceLoading || challengeLoading || opportunityLoading,
          isLeavingCommunity,
        },
        { leaveCommunity: handleLeaveCommunity }
      )}
    </>
  );
};

export default ContributionDetailsContainer;
