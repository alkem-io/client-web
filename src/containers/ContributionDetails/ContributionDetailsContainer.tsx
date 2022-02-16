import React, { FC, useMemo } from 'react';
import { ContributionCardV2Details } from '../../components/composite/common/cards';
import {
  useChallengeContributionDetailsQuery,
  useEcoverseContributionDetailsQuery,
  useOpportunityContributionDetailsQuery,
} from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { ContributionItem } from '../../models/entities/contribution';
import { buildChallengeUrl, buildEcoverseUrl, buildOpportunityUrl } from '../../utils/urlBuilders';
import { getVisualBanner } from '../../utils/visuals.utils';

export interface EntityDetailsContainerEntities {
  details?: ContributionCardV2Details;
}

export interface EntityDetailsContainerState {
  loading: boolean;
}

export interface EntityDetailsContainerActions {}

export interface EntityDetailsContainerProps
  extends ContainerProps<EntityDetailsContainerEntities, EntityDetailsContainerActions, EntityDetailsContainerState> {
  entities: ContributionItem;
}

const ContributionDetailsContainer: FC<EntityDetailsContainerProps> = ({ entities, children }) => {
  const { hubId, challengeId, opportunityId } = entities;
  const { data: hubData, loading: hubLoading } = useEcoverseContributionDetailsQuery({
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

  const details = useMemo(() => {
    if (hubData)
      return {
        headerText: hubData.hub.displayName,
        type: 'hub',
        mediaUrl: getVisualBanner(hubData.hub.context?.visuals),
        tags: hubData.hub.tagset?.tags || [],
        url: buildEcoverseUrl(hubData.hub.nameID),
      } as ContributionCardV2Details;

    if (challengeData)
      return {
        headerText: challengeData.hub.challenge.displayName,
        type: 'challenge',
        mediaUrl: getVisualBanner(challengeData.hub.challenge.context?.visuals),
        tags: challengeData.hub.challenge.tagset?.tags || [],
        url: buildChallengeUrl(challengeData.hub.nameID, challengeData.hub.challenge.nameID),
      } as ContributionCardV2Details;

    if (opportunityData)
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
      } as ContributionCardV2Details;
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
