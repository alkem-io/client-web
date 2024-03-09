import React, { FC, useCallback, useMemo } from 'react';
import {
  useChallengeContributionDetailsQuery,
  useSpaceContributionDetailsQuery,
  useOpportunityContributionDetailsQuery,
  useRemoveUserAsCommunityMemberMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { ContributionItem } from '../../user/contribution';
import { buildChallengeUrl, buildSpaceUrl, buildOpportunityUrl } from '../../../../main/routing/urlBuilders';
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
  isDemoSpace?: boolean;
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

  const { data: challengeData, loading: challengeLoading } = useChallengeContributionDetailsQuery({
    variables: {
      spaceId: spaceId,
      challengeId: challengeId || '',
    },
    skip: !challengeId || Boolean(opportunityId),
  });

  const { data: opportunityData, loading: opportunityLoading } = useOpportunityContributionDetailsQuery({
    variables: {
      spaceId: spaceId,
      opportunityId: opportunityId || '',
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
        journeyUri: buildSpaceUrl(spaceData.space.nameID),
        communityId: spaceData.space.community?.id,
        tagline: spaceData.space.profile.tagline ?? '',
        spaceVisibility: spaceData.space.account.license.visibility,
      };
    }

    if (challengeData) {
      return {
        displayName: challengeData.space.challenge.profile.displayName,
        journeyTypeName: 'challenge',
        banner: getVisualByType(VisualName.CARD, challengeData.space.challenge.profile.visuals),
        tags: challengeData.space.challenge.profile.tagset?.tags ?? [],
        journeyUri: buildChallengeUrl(challengeData.space.nameID, challengeData.space.challenge.nameID),
        communityId: challengeData.space.challenge.community?.id,
        tagline: challengeData.space.challenge.profile.tagline ?? '',
        spaceVisibility: challengeData.space.account.license.visibility,
      };
    }

    if (opportunityData) {
      return {
        displayName: opportunityData.space.opportunity.profile.displayName,
        journeyTypeName: 'opportunity',
        banner: getVisualByType(VisualName.CARD, opportunityData.space.opportunity.profile.visuals),
        tags: opportunityData.space.opportunity.profile.tagset?.tags ?? [],
        journeyUri: buildOpportunityUrl(
          opportunityData.space.nameID,
          opportunityData.space.opportunity.parentNameID || '',
          opportunityData.space.opportunity.nameID
        ),
        communityId: opportunityData.space.opportunity.community?.id,
        tagline: opportunityData.space.opportunity.profile.tagline ?? '',
        spaceVisibility: opportunityData.space.account.license.visibility,
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
