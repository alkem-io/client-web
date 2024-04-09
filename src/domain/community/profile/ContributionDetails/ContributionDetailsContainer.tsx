import React, { FC, useCallback, useMemo } from 'react';
import {
  useChallengeContributionDetailsQuery,
  useOpportunityContributionDetailsQuery,
  useRemoveUserAsCommunityMemberMutation,
  useSpaceContributionDetailsQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { ContributionItem } from '../../user/contribution';
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

export interface EntityDetailsContainerProps
  extends ContainerChildProps<
    EntityDetailsContainerEntities,
    EntityDetailsContainerActions,
    EntityDetailsContainerState
  > {
  entities: ContributionItem;
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
  const { spaceId, subspaceId: challengeId, subsubspaceId: opportunityId } = entities;
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user?.id;
  const { data: spaceData, loading: spaceLoading } = useSpaceContributionDetailsQuery({
    variables: {
      spaceId: spaceId,
    },
    skip: Boolean(challengeId) || Boolean(opportunityId),
  });

  const { data: challengeData, loading: challengeLoading } = useChallengeContributionDetailsQuery({
    variables: {
      challengeId: challengeId!,
    },
    skip: !challengeId || Boolean(opportunityId),
  });

  const { data: opportunityData, loading: opportunityLoading } = useOpportunityContributionDetailsQuery({
    variables: {
      opportunityId: opportunityId!,
    },
    skip: !opportunityId,
  });

  const [leaveCommunity, { loading: isLeavingCommunity }] = useRemoveUserAsCommunityMemberMutation();

  const details = useMemo<ContributionDetails | undefined>(() => {
    if (spaceData) {
      return {
        displayName: spaceData.space.profile.displayName,
        journeyTypeName: 'space',
        banner: getVisualByType(VisualName.CARD, spaceData.space.profile.visuals),
        tags: spaceData.space.profile.tagset?.tags ?? [],
        journeyUri: spaceData.space.profile.url,
        communityId: spaceData.space.community?.id,
        tagline: spaceData.space.profile.tagline ?? '',
      };
    }

    if (challengeData) {
      return {
        displayName: challengeData.lookup.subspace?.profile.displayName!,
        journeyTypeName: 'challenge',
        banner: getVisualByType(VisualName.CARD, challengeData.lookup.subspace?.profile.visuals),
        tags: challengeData.lookup.subspace?.profile.tagset?.tags ?? [],
        journeyUri: challengeData.lookup.subspace?.profile.url!,
        communityId: challengeData.lookup.subspace?.community?.id,
        tagline: challengeData.lookup.subspace?.profile.tagline ?? '',
      };
    }

    if (opportunityData) {
      return {
        displayName: opportunityData.lookup.subsubspace?.profile.displayName!,
        journeyTypeName: 'opportunity',
        banner: getVisualByType(VisualName.CARD, opportunityData.lookup.subsubspace?.profile.visuals),
        tags: opportunityData.lookup.subsubspace?.profile.tagset?.tags ?? [],
        journeyUri: opportunityData.lookup.subsubspace?.profile.url!,
        communityId: opportunityData.lookup.subsubspace?.community?.id,
        tagline: opportunityData.lookup.subsubspace?.profile.tagline ?? '',
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
