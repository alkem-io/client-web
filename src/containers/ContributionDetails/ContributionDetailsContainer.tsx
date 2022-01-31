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
  const { ecoverseId, challengeId, opportunityId } = entities;
  const { data: ecoverseData, loading: ecoverseLoading } = useEcoverseContributionDetailsQuery({
    variables: {
      ecoverseId: ecoverseId,
    },
    skip: Boolean(challengeId) || Boolean(opportunityId),
  });

  const { data: challengeData, loading: challengeLoading } = useChallengeContributionDetailsQuery({
    variables: {
      ecoverseId: ecoverseId,
      challengeId: challengeId || '',
    },
    skip: !challengeId || Boolean(opportunityId),
  });

  const { data: opportunityData, loading: opportunityLoading } = useOpportunityContributionDetailsQuery({
    variables: {
      ecoverseId: ecoverseId,
      opportunityId: opportunityId || '',
    },
    skip: !opportunityId,
  });

  const details = useMemo(() => {
    if (ecoverseData)
      return {
        headerText: ecoverseData.ecoverse.displayName,
        type: 'hub',
        mediaUrl: getVisualBanner(ecoverseData.ecoverse.context?.visuals),
        tags: ecoverseData.ecoverse.tagset?.tags || [],
        url: buildEcoverseUrl(ecoverseData.ecoverse.nameID),
      } as ContributionCardV2Details;

    if (challengeData)
      return {
        headerText: challengeData.ecoverse.challenge.displayName,
        type: 'challenge',
        mediaUrl: getVisualBanner(challengeData.ecoverse.challenge.context?.visuals),
        tags: challengeData.ecoverse.challenge.tagset?.tags || [],
        url: buildChallengeUrl(challengeData.ecoverse.nameID, challengeData.ecoverse.challenge.nameID),
      } as ContributionCardV2Details;

    if (opportunityData)
      return {
        headerText: opportunityData.ecoverse.opportunity.displayName,
        type: 'opportunity',
        mediaUrl: getVisualBanner(opportunityData.ecoverse.opportunity.context?.visuals),
        tags: opportunityData.ecoverse.opportunity.tagset?.tags || [],
        url: buildOpportunityUrl(
          opportunityData.ecoverse.nameID,
          opportunityData.ecoverse.opportunity.parentNameID || '',
          opportunityData.ecoverse.opportunity.nameID
        ),
      } as ContributionCardV2Details;
  }, [ecoverseData, challengeData, opportunityData]);

  return (
    <>
      {children(
        { details },
        {
          loading: ecoverseLoading || challengeLoading || opportunityLoading,
        },
        {}
      )}
    </>
  );
};
export default ContributionDetailsContainer;
