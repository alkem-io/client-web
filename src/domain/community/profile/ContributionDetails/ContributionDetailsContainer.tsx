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
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';
import { useUserContext } from '../../contributor/user/hooks/useUserContext';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';

type mediaSize = 'small' | 'medium' | 'large';

export interface ContributionDetails {
  headerText?: string;
  labelText?: string;
  labelAboveTitle?: boolean; // if true, the label will appear above the title - temp solution
  descriptionText?: string;
  tags?: string[];
  mediaUrl?: string;
  mediaSize?: mediaSize;
  url?: string;
  keepScroll?: boolean;
  domain?: {
    communityID: string;
  };
}

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

interface ContributionDetails {
  displayName: string;
  journeyTypeName: JourneyTypeName;
  bannerUri?: string;
  tags: string[];
  journeyUri: string;
  communityId?: string;
  tagline: string;
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
        displayName: hubData.hub.displayName,
        journeyTypeName: 'hub',
        bannerUri: getVisualBanner(hubData.hub.context?.visuals),
        tags: hubData.hub.tagset?.tags ?? [],
        journeyUri: buildHubUrl(hubData.hub.nameID),
        communityId: hubData.hub.community?.id,
        tagline: hubData.hub.context?.tagline ?? '',
      };
    }

    if (challengeData) {
      return {
        displayName: challengeData.hub.challenge.displayName,
        journeyTypeName: 'challenge',
        bannerUri: getVisualBanner(challengeData.hub.challenge.context?.visuals),
        tags: challengeData.hub.challenge.tagset?.tags ?? [],
        journeyUri: buildChallengeUrl(challengeData.hub.nameID, challengeData.hub.challenge.nameID),
        communityId: challengeData.hub.challenge.community?.id,
        tagline: challengeData.hub.challenge.context?.tagline ?? '',
      };
    }

    if (opportunityData) {
      return {
        displayName: opportunityData.hub.opportunity.displayName,
        journeyTypeName: 'opportunity',
        bannerUri: getVisualBanner(opportunityData.hub.opportunity.context?.visuals),
        tags: opportunityData.hub.opportunity.tagset?.tags ?? [],
        journeyUri: buildOpportunityUrl(
          opportunityData.hub.nameID,
          opportunityData.hub.opportunity.parentNameID || '',
          opportunityData.hub.opportunity.nameID
        ),
        communityId: opportunityData.hub.opportunity.community?.id,
        tagline: opportunityData.hub.opportunity.context?.tagline ?? '',
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
        refetchQueries: [refetchRolesUserQuery({ input: { userID: userId } })],
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
