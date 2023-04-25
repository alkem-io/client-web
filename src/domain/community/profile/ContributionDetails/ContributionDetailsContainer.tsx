import React, { FC, useCallback, useMemo } from 'react';
import {
  refetchRolesUserQuery,
  useChallengeContributionDetailsQuery,
  useHubContributionDetailsQuery,
  useOpportunityContributionDetailsQuery,
  useRemoveUserAsCommunityMemberMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { ContributionItem } from '../../contributor/contribution';
import { buildChallengeUrl, buildHubUrl, buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { getVisualBannerNarrow, getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { useUserContext } from '../../contributor/user/hooks/useUserContext';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
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
  bannerUri?: string;
  bannerAltText?: string;
  tags: string[];
  journeyUri: string;
  communityId?: string;
  tagline: string;
  isDemoHub?: boolean;
}

const ContributionDetailsContainer: FC<EntityDetailsContainerProps> = ({ entities, children }) => {
  const { hubId, challengeId, opportunityId } = entities;
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user?.id;
  const { data: hubData, loading: hubLoading } = useHubContributionDetailsQuery({
    variables: {
      hubId: hubId,
    },
    skip: Boolean(challengeId) || Boolean(opportunityId),
  });

  const { data: challengeData, loading: challengeLoading } = useChallengeContributionDetailsQuery({
    variables: {
      hubId: hubId,
      challengeId: challengeId || '',
    },
    skip: !challengeId || Boolean(opportunityId),
  });

  const { data: opportunityData, loading: opportunityLoading } = useOpportunityContributionDetailsQuery({
    variables: {
      hubId: hubId,
      opportunityId: opportunityId || '',
    },
    skip: !opportunityId,
  });

  const [leaveCommunity, { loading: isLeavingCommunity }] = useRemoveUserAsCommunityMemberMutation();

  const details = useMemo<ContributionDetails | undefined>(() => {
    if (hubData) {
      return {
        displayName: hubData.hub.profile.displayName,
        journeyTypeName: 'hub',
        bannerUri: getVisualBannerNarrow(hubData.hub.profile.visuals),
        bannerAltText: getVisualByType(VisualName.BANNER, hubData.hub.profile?.visuals)?.alternativeText,
        tags: hubData.hub.profile.tagset?.tags ?? [],
        journeyUri: buildHubUrl(hubData.hub.nameID),
        communityId: hubData.hub.community?.id,
        tagline: hubData.hub.profile.tagline ?? '',
        hubVisibility: hubData.hub.visibility,
      };
    }

    if (challengeData) {
      return {
        displayName: challengeData.hub.challenge.profile.displayName,
        journeyTypeName: 'challenge',
        bannerUri: getVisualBannerNarrow(challengeData.hub.challenge.profile.visuals),
        tags: challengeData.hub.challenge.profile.tagset?.tags ?? [],
        journeyUri: buildChallengeUrl(challengeData.hub.nameID, challengeData.hub.challenge.nameID),
        communityId: challengeData.hub.challenge.community?.id,
        tagline: challengeData.hub.challenge.profile.tagline ?? '',
        hubVisibility: challengeData.hub.visibility,
      };
    }

    if (opportunityData) {
      return {
        displayName: opportunityData.hub.opportunity.profile.displayName,
        journeyTypeName: 'opportunity',
        bannerUri: getVisualBannerNarrow(opportunityData.hub.opportunity.profile.visuals),
        tags: opportunityData.hub.opportunity.profile.tagset?.tags ?? [],
        journeyUri: buildOpportunityUrl(
          opportunityData.hub.nameID,
          opportunityData.hub.opportunity.parentNameID || '',
          opportunityData.hub.opportunity.nameID
        ),
        communityId: opportunityData.hub.opportunity.community?.id,
        tagline: opportunityData.hub.opportunity.profile.tagline ?? '',
        hubVisibility: opportunityData.hub.visibility,
      };
    }
  }, [hubData, challengeData, opportunityData]);

  const handleLeaveCommunity = useCallback(async () => {
    if (details?.communityId && userId)
      await leaveCommunity({
        variables: {
          memberId: userId,
          communityId: details?.communityId,
        },
        refetchQueries: [refetchRolesUserQuery({ input: userId })],
        awaitRefetchQueries: true,
      });
  }, [userId, details?.communityId, leaveCommunity]);

  return (
    <>
      {children(
        { details },
        {
          loading: hubLoading || challengeLoading || opportunityLoading,
          isLeavingCommunity,
        },
        { leaveCommunity: handleLeaveCommunity }
      )}
    </>
  );
};

export default ContributionDetailsContainer;
