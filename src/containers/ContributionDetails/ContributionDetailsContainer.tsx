import React, { FC, useMemo } from 'react';
import { ContributionCardV2Details } from '../../common/components/composite/common/cards';
import {
  useChallengeContributionDetailsQuery,
  useHubContributionDetailsQuery,
  useOpportunityContributionDetailsQuery,
} from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import { ContributionItem } from '../../models/entities/contribution';
import { buildChallengeUrl, buildHubUrl, buildOpportunityUrl } from '../../common/utils/urlBuilders';
import { getVisualBanner } from '../../common/utils/visuals.utils';

export interface EntityDetailsContainerEntities {
  details?: ContributionCardV2Details;
}

export interface EntityDetailsContainerState {
  loading: boolean;
}

export interface EntityDetailsContainerActions {}

export interface EntityDetailsContainerProps
  extends ContainerChildProps<
    EntityDetailsContainerEntities,
    EntityDetailsContainerActions,
    EntityDetailsContainerState
  > {
  entities: ContributionItem;
}

const buildDomainObject = (communityID: string | undefined) => {
  return typeof communityID === 'undefined' ? undefined : { communityID };
};

const ContributionDetailsContainer: FC<EntityDetailsContainerProps> = ({ entities, children }) => {
  const { hubId, challengeId, opportunityId } = entities;
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

  const details = useMemo<ContributionCardV2Details | undefined>(() => {
    if (hubData) {
      return {
        headerText: hubData.hub.displayName,
        type: 'hub',
        mediaUrl: getVisualBanner(hubData.hub.context?.visuals),
        tags: hubData.hub.tagset?.tags || [],
        url: buildHubUrl(hubData.hub.nameID),
        domain: buildDomainObject(hubData.hub.community?.id),
      };
    }

    if (challengeData) {
      return {
        headerText: challengeData.hub.challenge.displayName,
        type: 'challenge',
        mediaUrl: getVisualBanner(challengeData.hub.challenge.context?.visuals),
        tags: challengeData.hub.challenge.tagset?.tags || [],
        url: buildChallengeUrl(challengeData.hub.nameID, challengeData.hub.challenge.nameID),
        domain: buildDomainObject(challengeData.hub.challenge.community?.id),
      };
    }

    if (opportunityData) {
      return {
        headerText: opportunityData.hub.opportunity.displayName,
        type: 'opportunity',
        mediaUrl: getVisualBanner(opportunityData.hub.opportunity.context?.visuals),
        tags: opportunityData.hub.opportunity.tagset?.tags || [],
        url: buildOpportunityUrl(
          opportunityData.hub.nameID,
          opportunityData.hub.opportunity.parentNameID || '',
          opportunityData.hub.opportunity.nameID
        ),
        domain: buildDomainObject(opportunityData.hub.opportunity.community?.id),
      };
    }
  }, [hubData, challengeData, opportunityData]);

  return (
    <>
      {children(
        { details },
        {
          loading: hubLoading || challengeLoading || opportunityLoading,
        },
        {}
      )}
    </>
  );
};
export default ContributionDetailsContainer;
